$(function() {
	var content = localStorage.getItem('content'),
		$switcher = $('.switcher'),
		$content = $('.content');

	if (content) {
		$content.html(content);
	}

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
		localStorage.setItem('content', $content.html());
	});
});
