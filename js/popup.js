var bgPage = chrome.extension.getBackgroundPage(),
	client = bgPage.client,
	account = localStorage.getItem('account');

$(function() {
	var $loginLogoutButton = $(".login"),
		$content = $('.content');

	if (bgPage.loggedIn) {
		if (!account) {
			client.getAccountInfo(function(error, accountInfo) {
				$content.html('Hey, <b class="text-primary">' + accountInfo.name + '!</b>');
			});
		} else {
			$content.html('Hey, <b class="text-primary">' + account + '!</b>');
		}

		$loginLogoutButton.html('Disconnect from Dropbox');
	} else {
		$content.html('<span class="text-muted">Status:</span> not synced');
		$loginLogoutButton.text('Sync with Dropbox');
	}

	$loginLogoutButton.click(function() {
		if (bgPage.loggedIn) {
			bgPage.signoutBtnPress();

			$content.html('<span class="text-muted">Status:</span> not synced');
			$loginLogoutButton.text('Sync with Dropbox');
		} else {
			bgPage.authBtnPress();
		}
	});
});
