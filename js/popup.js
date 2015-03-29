var bgPage = chrome.extension.getBackgroundPage(),
	client = bgPage.client;

$(function() {
	var $loginLogoutButton = $(".login"),
		$content = $('.content');

	if (bgPage.loggedIn) {
		client.getAccountInfo(function(error, accountInfo) {
			$content.html('Hello, <b>' + accountInfo.name + '</b>!');
		});

		$loginLogoutButton.html('Log Out');
	} else {
		$content.html('Not logged in');
		$loginLogoutButton.text('Login with Dropbox');
	}

	$loginLogoutButton.click(function() {
		if (bgPage.loggedIn) {
			bgPage.signoutBtnPress();

			$content.html('Not logged in');
			$loginLogoutButton.text('Login with Dropbox');
		} else {
			bgPage.authBtnPress();
		}
	});
});
