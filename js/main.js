$(function() {
	var content = localStorage.getItem('content'),
		$editor = $('.editor'),
		$source = $('.source'),
		$preview = $('.preview'),
		$switcher = $('.switcher'),
		converter = new Showdown.converter();

	if (!content || content == '') {
		content = 'Don\'t make me think...';
	}

	$source.val(content);

	$(window).resize(function() {
		$source.css({
			height: (window.innerHeight - 53) + 'px'
		});
	}).trigger('resize');

	$source.keyup(function() {
		content = $source.val();

		$preview.html(converter.makeHtml(content));
		localStorage.setItem('content', content);
	}).trigger('keyup');

	$switcher.on('click', function(e) {
		e.preventDefault();

		if ($switcher.text() == 'Enable') {
			$editor.addClass('active');
			$source.trigger('input');
			$switcher.text('Disable');
		} else {
			$editor.removeClass('active');
			$switcher.text('Enable');
		}
	});
});

//$(function() {
//	var content = localStorage.getItem('content'),
//		$switcher = $('.switcher'),
//		$fnSuper = $('.fn-super'),
//		$content = $('.content');
//
//	if (content) {
//		$content.html(content);
//	}
//
//	$fnSuper.on('click', function() {
//		replaceSelectedText();
//	});
//
//	$switcher.on('click', function(e) {
//		e.preventDefault();
//
//		if ($content.attr('contenteditable') == 'false') {
//			$content.attr('contenteditable', true);
//			$switcher.text('Disable');
//		} else {
//			$content.attr('contenteditable', false);
//			$switcher.text('Enable');
//		}
//	});
//
//	$content.on('DOMSubtreeModified', function() {
//		var contentHtml = $content.html();
//
//		localStorage.setItem('content', contentHtml);
//	});
//});
//
//function replaceSelectedText() {
//	var range, html;
//	if (window.getSelection && window.getSelection().getRangeAt) {
//		var sel = window.getSelection(),
//			data = sel.anchorNode.data;
//
//		range = sel.getRangeAt(0);
//		range.deleteContents();
//
//		var div = document.createElement("div");
//		div.innerHTML = '<div class="super">' + data + '</div>';
//		var frag = document.createDocumentFragment(), child;
//
//		while ( (child = div.firstChild) ) {
//			frag.appendChild(child);
//		}
//		range.insertNode(frag);
//	} else if (document.selection && document.selection.createRange) {
//		range = document.selection.createRange();
//		range.pasteHTML(html);
//	}
//}
