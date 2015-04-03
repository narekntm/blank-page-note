var bgPage = chrome.extension.getBackgroundPage(),
	client = bgPage.client,
	local = '',
	remote = '';

$(function() {
	setTimeout(function() {
		client.getAccountInfo(function(error, accountInfo) {
			localStorage.setItem('account', accountInfo.name);
		});

		if (bgPage.loggedIn) {
			local = localStorage.getItem('content');

			client.readFile("md_blank.txt", function(error, data) {
				if (error) {
					return console.log(error);
				}

				if (data == local) {
					window.close();
				}

				remote = data;

				$('.remote').text(remote);
			});

			$('.local').text(local);
		} else {
			$('.container').html('<div class="row">' +
				'<div class="col-sm-offset-3 col-sm-6">Please login</div>' +
			'</div> ');
		}

		$('.take-local').click(function(e) {
			e.preventDefault();

			window.close();
		});

		$('.take-remote').click(function(e) {
			e.preventDefault();

			localStorage.setItem('content', remote);

			window.close();
		});
	}, 1000);
});
