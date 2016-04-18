var db;

$(function() {
	setupEditor();
	migrate();
	setupEnv();

	$('.new').click(function(e) {
		e.preventDefault();

		drawTab('New Tab');
	});
});

$.fn.oneClickSelect = function() {
	return $(this).on('click', function() {
		var range, selection;

		selection = window.getSelection();
		range = document.createRange();
		range.selectNodeContents(this);
		selection.removeAllRanges();
		selection.addRange(range);

		// Copy to clipboard
		document.execCommand('copy');
	});
};

function setupEnv() {
	var $editor = $('.editor'),
		$source = $('.source'),
		$preview = $('.preview'),
		$switcher = $('.switcher'),
		converter = new Showdown.converter();

	drawTabs();
	setTabActive();

	//$source.keyup(function() {
	//	var tabContentSource = $source.val(),
	//		tabContentPreview = converter.makeHtml(tabContentSource),
	//		activeTabIndex = $('.tabs li.active').attr('data-index');
	//
	//	content[activeTabIndex] = tabContentSource;
	//
	//	$preview.html(tabContentPreview);
	//
	//	localStorage.setItem('content', content);
	//}).trigger('keyup');
	//
	//$switcher.on('click', function(e) {
	//	e.preventDefault();
	//
	//	if ($switcher.text() == 'Enable') {
	//		$editor.addClass('active');
	//		$source.trigger('input');
	//		$switcher.text('Disable');
	//	} else {
	//		$editor.removeClass('active');
	//		$switcher.text('Enable');
	//	}
	//});
	//
	//// to force focus and change css style
	//$('code').attr('tabindex', 0);
	//
	//// Select and copy on click
	//$('code').oneClickSelect();
}

function drawTabs() {
	for (var localStorageItem in localStorage) {
		if (localStorage.hasOwnProperty(localStorageItem)) {
			if (localStorageItem == 'v') {
				return true;
			}

			drawTab(localStorageItem);
		}
	}
}

function drawTab(name) {
	var tab = $('.tab-template.hide').clone(),
		clearName = sanitizeTabName(name);

	tab
		.removeClass('tab-template')
		.removeClass('hide')
		.addClass('tab')
		.find('a').attr('href', '#' + clearName);

	tab.find('.tab-name-input').val(name);

	$('.tabs').append(tab);

	return clearName;
}

function sanitizeTabName(name) {
	return name.toLowerCase().replace(/[^a-z0-9]/i, '');
}

function setTabActive() {
	$('.tab').eq(0).addClass('active');
}

function migrate() {
	if (localStorage.getItem('v') == 1) {
		localStorage.setItem('General', localStorage.getItem('content'));
	}

	if (localStorage.hasOwnProperty('account')) {
		localStorage.removeItem('account');
	}

	localStorage.removeItem('content');

	localStorage.setItem('v', 2);
}

function setupEditor() {
	$(window).resize(function() {
		$('.source').css({
			height: (window.innerHeight - 53) + 'px'
		});
	}).trigger('resize');

	if (!localStorage.hasOwnProperty('v')) {
		localStorage.setItem('v', 1);
	}

	if (!localStorage.hasOwnProperty('content')) {
		localStorage.setItem('content', 'Don\'t make me think...');
	}
}
