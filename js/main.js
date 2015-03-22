$(function() {
	var switcher = $('.switcher'),
		content = $('.content');

	switcher.on('click', function(e) {
		e.preventDefault();

		console.log(content.attr('contenteditable'));

		if (content.attr('contenteditable') == 'false') {
			content.attr('contenteditable', true);
			switcher.text('Disable');
		} else {
			content.attr('contenteditable', false);
			switcher.text('Enable');
		}
	});

	content.on('DOMSubtreeModified', function() {
		console.log('edited');
	});
});
