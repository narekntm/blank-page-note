$(function() {
	var content = localStorage.getItem('content'),
		$switcher = $('.switcher'),
		$fnSuper = $('.fn-super'),
		$content = $('.content');

	if (content) {
		$content.html(content);
	}

	$fnSuper.on('click', function() {
		replaceSelectedText();
	});

	$switcher.on('click', function(e) {
		e.preventDefault();

		if ($content.attr('contenteditable') == 'false') {
			$content.attr('contenteditable', true);
			$switcher.text('Disable');
		} else {
			$content.attr('contenteditable', false);
			$switcher.text('Enable');
		}
	});

	$content.on('DOMSubtreeModified', function() {
		var contentHtml = $content.html();

		localStorage.setItem('content', contentHtml);
	});
});

function replaceSelectedText() {
	var range, html;
	if (window.getSelection && window.getSelection().getRangeAt) {
		var sel = window.getSelection(),
			data = sel.anchorNode.data;

		range = sel.getRangeAt(0);
		range.deleteContents();

		var div = document.createElement("div");
		div.innerHTML = '<div class="super">' + data + '</div>';
		var frag = document.createDocumentFragment(), child;

		while ( (child = div.firstChild) ) {
			frag.appendChild(child);
		}
		range.insertNode(frag);
	} else if (document.selection && document.selection.createRange) {
		range = document.selection.createRange();
		range.pasteHTML(html);
	}
}
