function storageSet(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({[key]: value}, function () {
            if (chrome.runtime.lastError) {
                alert("Too long data please shorten it!\nRefresh and try again.")
            }
            resolve(true);
        });
    });
}

function storageGet(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, function (result) {
            if (key) {
                resolve(result[key]);
            } else {
                resolve(result);
            }
        });
    });
}

function storageRemove(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.remove(key, function () {
            resolve(true);
        });
    });
}

let converter = new Showdown.converter(),
    NEW_TAB_NAME = 'New Tab Name',
    NEW_TAB_CONTENT = 'Don\'t make me think...';

let code = $('code'),
  pre = $('pre'),
  nav = $('.nav'),
    linksModal = $('#links-modal');

async function init() {
    await setupEditor();
    await migrate();
    await setupEnv();

    $('.new').click(function (e) {
        e.preventDefault();

        if ($('.tab').length == 5) {
            return;
        }
        drawNewTab(NEW_TAB_NAME, NEW_TAB_CONTENT);
    });

    nav.on('click', '.delete-tab', async function (e, force) {
        e.preventDefault();

        if (force) {
            await deleteTab($(this).closest('li'));
        }
    });

    linksModal.on('click', '.delete-link', function (e) {
        e.preventDefault();

        $(this).closest('.form-group').remove();
    });

    nav.on('input change', '.tab-name-input', function () {
        saveTabName($(this).closest('a').attr('data-id'), $(this).val());
    });

    $('.tabs').on('click', '.tab', function (e) {
        e.preventDefault();

        if ($(e.target).hasClass('delete-tab')) {
            return;
        }
        switchTab($(this));
    });

    $('.add-new-link').on('click', function (e) {
        e.preventDefault();

        drawNewLinkInput();
    });

    $(document).on('click', 'code, pre', function () {
        let range, selection;

        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents($(this)[0]);
        selection.removeAllRanges();
        selection.addRange(range);

        // Copy to clipboard
        document.execCommand('copy');
    });

    $('#generic-modal').on('show.bs.modal', function (e) {
        let deleteBtn = $('.delete-tab-confirm'),
            button = $(e.relatedTarget),
            modal = $(this),
            tabName = button.closest('.tab').find('.tab-name-input').val();

        modal.find('.tab-name').text(tabName);

        deleteBtn.off('click');
        deleteBtn.on('click', function () {
            button.trigger('click', [true]);
        });
    });

    linksModal.on('show.bs.modal', async function (e) {
        let links = await storageGet('links');

        if (!links.length) {
            $(this).find('.add-new-link').trigger('click');
        }
    });

    $('.save-links').on('click', async function (e) {
        e.preventDefault();

        await saveLinks();
    });

    // to force focus and change css style
    code.attr('tabindex', 0);
    pre.attr('tabindex', 0);

    await drawLinkInputs();
    await drawLinks();
};

async function drawLinks() {
    // let links = JSON.parse(await storageGet('links'));
    let links = await storageGet('links');
    $('.link-item').remove();

    if (links.length) {
        for (let i in links) {
            if (links.hasOwnProperty(i)) {
                drawNewLink(links[i]['name'], links[i]['url']);
            }
        }
    }
}

function drawNewLink(linkName, linkUrl) {
    let linkItem = $('.link-template').clone();

    linkItem
        .removeClass('link-template')
        .removeClass('hide')
        .addClass('link-item');

    linkItem.find('a')
        .attr('href', linkUrl)
        .text(linkName);

    $('.links').append(linkItem);
}

async function drawLinkInputs() {
    if (!await storageGet('links')) {
        await storageSet('links', []);
    }

    let links = await storageGet('links');

    if (links.length) {
        for (let i in links) {
            if (links.hasOwnProperty(i)) {
                drawNewLinkInput(links[i]['name'], links[i]['url']);
            }
        }
    }
}

function drawNewLinkInput(name, url) {
    let linkTemplate = $('.link-input-template').clone();

    linkTemplate
        .removeClass('hide')
        .removeClass('link-input-template')
        .addClass('link-group-item');

    if (name) {
        linkTemplate.find('.link-name').val(name);
    }

    if (url) {
        linkTemplate.find('.link-url').val(url);
    }

    $('.link-group').append(
        linkTemplate
    );

    activateSortableLinks();
}

async function saveLinks() {
    let links = [],
        linkGroupItems = $('.link-group-item'),
        linkName,
        linkUrl;

    linkGroupItems.each(function () {
        linkName = $(this).find('.link-name').val();
        linkUrl = $(this).find('.link-url').val();

        if (linkName && linkUrl) {
            links.push({
                name: linkName,
                url: linkUrl
            });
        }
    });

    await storageSet('links', links);

    linksModal.modal('hide');
    drawLinks();
}

async function setupEnv() {
    let editor = $('.editor'),
        source = $('.source'),
        preview = $('.preview'),
        switcher = $('.switcher');

    await drawTabs();
    let activeTabId = setFirstTabActive();
    if (await drawTabContent(activeTabId)) {
        source.keyup(function () {
            let tabContentSource = source.val(),
                tabContentPreview = converter.makeHtml(tabContentSource),
                tabId = $('.tabs li.active a').attr('data-id');

            saveTabContent(tabId, tabContentSource);
            preview.html(tabContentPreview);
            preview.find('code').attr('tabindex', 1);
            preview.find('pre').attr('tabindex', 1);
        });

        switcher.on('click', function (e) {
            e.preventDefault();

            if (switcher.text() == 'Enable') {
                editor.addClass('active');
                source.trigger('input');
                switcher.text('Disable');
            } else {
                editor.removeClass('active');
                switcher.text('Enable');
            }
        });
    }
}

async function saveTabContent(tabId, tabContent) {
    let tabsData = await storageGet('data');

    tabsData[tabId]['content'] = tabContent;
    await storageSet('data', tabsData);
}

async function saveTabName(tabId, tabName) {
    let tabsData = await storageGet('data');

    tabsData[tabId]['name'] = tabName;
    await storageSet('data', tabsData);
}

async function drawTabContent(tabId) {
    let tabData = await getTabData(tabId),
        tabContentMd = tabData.content;
    if (tabData === false) {
        alert('Cannot draw a tab with id #' + tabId);
        return false;
    }

    $('.source').val(tabContentMd);
    $('.preview').html(
        converter.makeHtml(
            converter.makeHtml(tabContentMd)
        )
    ).find('code, pre').attr('tabindex', 1);

    return true;
}

async function drawTabs() {
    let data = await storageGet('ids');
    for (let index in data) {
        if (data.hasOwnProperty(index)) {
            await drawTab(data[index], index == 0);
        }
    }
}

async function saveNewTabData(tabId, tabName, tabContent) {
    let tabData = await storageGet('data'),
        idList = await storageGet('ids');
    idList.push(tabId);
    tabData[tabId] = {
        name: tabName,
        content: tabContent
    };

    await storageSet('ids', idList);
    await storageSet('data', tabData);
}

async function drawTab(tabId, isPersistant) {
    let tabData = await getTabData(tabId),
        tabName = tabData.name;
    drawTabElement(tabId, tabName, isPersistant);
}

async function drawNewTab(tabName, tabContent) {
    let tabId = await getNextTabId(),
        tabEl;
    console.log(tabId)
    tabEl = drawTabElement(tabId, tabName, false);

    await saveNewTabData(tabId, tabName, tabContent);
    await switchTab(tabEl);
}

function drawTabElement(tabId, tabName, isPersistant) {
    let tabEl = $('.tab-template.hide').clone(),
        aEl;

    if (isPersistant) {
        tabEl.find('.delete-tab').remove();
    }

    tabEl
        .removeClass('tab-template')
        .removeClass('hide')
        .addClass('tab');

    aEl = tabEl.find('a');
    aEl.attr({
        'data-name': '#' + tabName.replace(' ', '_').toLowerCase(),
        'data-id': tabId,
    });

    tabEl.find('.tab-name-input').val(tabName);

    $('.tabs').append(tabEl);

    return tabEl;
}

async function getNextTabId() {
    let data = await storageGet("ids"),
        maxId = 0,
        id;
    console.log(data)
    for (id of data) {
        console.log(id)

        id = parseInt(id);
        console.log("id:", id)
        if (id > maxId) {
            maxId = id;
        }
    }
    console.log("maxid: ", maxId)
    return ++maxId;
}

async function getTabData(tabId) {
    let tabData = await storageGet('data');
    if (tabData.hasOwnProperty(tabId)) {
        return tabData[tabId];
    }

    await removeTabId(tabId);

    return false;
}

async function removeTabId(tabId) {
    let tabIdList = await storageGet('ids');

    for (let id in tabIdList) {
        if (id == tabId) {
            delete tabIdList[tabId];
        }
    }
}

function setFirstTabActive() {
    let firstTab = $('.tab').eq(0);
    firstTab.addClass('active');

    return firstTab.find('a').attr('data-id');
}

async function switchTab(tabEl) {
    let tabData = await storageGet('data')
    let tabId = parseInt(tabEl.find('a').attr('data-id'))
    let tabContent = tabData[tabId]['content'];

    $('.source').val(tabContent);
    $('.preview')
        .html(converter.makeHtml(tabContent))
        .find('code, pre').attr('tabindex', 1);

    $('.tabs > li').removeClass('active');
    tabEl.addClass('active');
}

async function deleteTab(tabEl) {
    let idList = await storageGet('ids'),
        data = await storageGet("data"),
        tabId = parseInt(tabEl.find('a').attr('data-id'));

    for (let i = 0; i < idList.length; i++) {
        if (idList[i] == tabId) {
            idList.splice(i, 1);
            delete data[tabId];
            break;
        }
    }

    await storageSet('ids', idList);
    await storageSet('data', data);
    tabEl.remove();

    setTimeout(function () {
        switchTab($('.tab').eq(0));
    }, 1);
}

async function migrate() {
    if (await storageGet('v') == 1) {
        await storageSet('data', {
            1: {
                name: 'General',
                content: await storageGet('content')
            }
        });
        await storageSet('ids', [1]);
    }

    if (await storageGet('account')) {
        await storageRemove('account');
    }
    await storageRemove('content');
    await storageSet('v', 2);
}

async function setupEditor() {
    $(window).resize(function () {
        $('.source').css({
            height: (window.innerHeight - 123) + 'px'
        });
    }).trigger('resize');

    if (!await storageGet('v')) {
        await storageSet('v', 1);
    }

    if (!await storageGet('content')) {
        await storageSet('content', NEW_TAB_CONTENT);
    }
}

function activateSortableLinks() {
    $('.link-group')
        .sortable('destroy')
        .sortable({
            handle: '.sort-handler',
            placeholderClass: 'link-group-item-placeholder'
        });
}

async function darkModeInit() {
    let storageDarkMode = await storageGet('Dark Mode On/Off');
    let checkbox = document.querySelector("input[id=darkMode]");
    let darkModeCss = document.getElementById("darkModeCss");

    if (typeof storageDarkMode == undefined) {
        storageDarkMode = false;
        darkModeCss.disabled = true;
        checkbox.checked = false;
    } else if (storageDarkMode == "on") {
        storageDarkMode = true;
        darkModeCss.disabled = false;
        checkbox.checked = true;
    } else {
        storageDarkMode = false;
        darkModeCss.disabled = true;
        checkbox.checked = false;
    }
    checkbox.addEventListener('change', async function () {
        if (this.checked) {
            await storageSet('Dark Mode On/Off', "on")
            darkModeCss.disabled = false;

        } else {
            await storageSet('Dark Mode On/Off', "off")
            darkModeCss.disabled = true;
        }
    });
}
init()
darkModeInit()

