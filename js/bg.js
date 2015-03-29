var loggedIn = false,
	client = new Dropbox.Client({
		key: 'dcwy7qoqjv9kk1n'
	});

client.authenticate({interactive: false}, function (error) {
	if (error) {
		alert('Authentication error: ' + error);
	}

	loggedIn = client.isAuthenticated();
});


function authBtnPress(callback) {
	if (!loggedIn) {
		client.authenticate({}, function (error) {
			if (error) {
				console.log('Authentication error: ' + error);
			}

			loggedIn = client.isAuthenticated();
		});
	}
}

function signoutBtnPress() {
	if (loggedIn) {
		client.signOut({}, function (error) {
			if (error) {
				alert('Sign out error: ' + error);
			}

			loggedIn = client.isAuthenticated();
		});
	}
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	window.open('sync.html', 'new');
});
