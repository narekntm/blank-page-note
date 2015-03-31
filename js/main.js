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

			var bgPage = chrome.extension.getBackgroundPage(),
				client = bgPage.client;

			if (bgPage.loggedIn) {
				client.writeFile("md_blank.txt", content, function(error, stat) {
					if (error) {
						return console.log(error);
					}

					console.log("File saved as revision " + stat.versionTag);
				});

				return false;
			} else {
				console.log('Not logged in');
			}
		}
	});

	// to force focus and change css style
	$('code').attr('tabindex', 0);

	// Select and copy on click
	$('code').oneClickSelect();
});

$.fn.oneClickSelect = function() {
	return $(this).on('click', function() {
		var range, selection;

		selection = window.getSelection();
		range = document.createRange();
		range.selectNodeContents(this);
		selection.removeAllRanges();
		selection.addRange(range);

		document.execCommand('copy');
	});
};
