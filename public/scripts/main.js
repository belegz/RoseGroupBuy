var rhit = rhit || {};

rhit.FB_COLLECTION_GROUPS = "Groups";
rhit.FB_KEY_GROUP_NAME = "Name";
rhit.FB_KEY_GROUP_SELLER = "Seller";
rhit.FB_KEY_GROUP_OWNER = "OwnerID";
rhit.FB_KEY_GROUP_ENDTIME = "EndTime";
rhit.FB_KEY_GROUP_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_GROUP_LOCATION = "Location";
rhit.FB_KEY_GROUP_STATUS = "Status";
rhit.FB_KEY_GROUP_TAGS = "Tags";
rhit.FB_KEY_GROUP_MEMBERS = "Members";
rhit.FB_KEY_GROUP_OWNERNAME = "OwnerName"

rhit.FB_COLLECTION_USERS = "Users";
rhit.FB_KEY_USERS_NAME = "Name";
rhit.FB_KEY_USERS_EMAIL = "Email";
rhit.FB_KEY_USERS_GROUPCOUNT = "GroundCount";
rhit.FB_KEY_USERS_USERNAME = "userName";
rhit.FB_KEY_USERS_RATE = "Rate";
rhit.FB_KEY_USERS_PHONENUMBER = "PhoneNumber";


rhit.fbGroupsManager = null;
rhit.fbSingleGroupManager = null;
rhit.fbAuthManager = null;
rhit.fbPersonalManager = null;
rhit.fbUser = null;

rhit.User = class {
	constructor(name, userName, Email) {
		this.name = name;
		this.username = userName;
		this.email = Email;
		this.groupCunt = 0;
		this.phoneNumber = "000-000-0000";
		this.rate = 0;
	}
}

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}


rhit.ListPageController = class {
	constructor() {

		document.querySelector("#menuAllGroups").addEventListener("click", (event) => {
			window.location.href = "/list.html";
		});

		document.querySelector("#menuMyProfile").addEventListener("click", (event) => {
			window.location.href = "/personal.html";
		});


		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			// console.log("sign out");
			rhit.fbAuthManager.signOut();
		});

		document.querySelector("#cancelAddGroup").addEventListener("click", (event) => {
			// console.log("submit");
			console.log("cancel, try to print date");
			var d = $('#inputTime').datetimepicker('getValue');
    		console.log(firebase.firestore.Timestamp.fromDate(d));
		});

		document.querySelector("#submitAddGroup").addEventListener("click", (event) => {
			// console.log("submit");
			const name = document.querySelector("#inputName").value;
			const seller = document.querySelector("#inputSeller").value;
			var d = $('#inputTime').datetimepicker('getValue');
			const endTime = firebase.firestore.Timestamp.fromDate(d);
			const location = document.querySelector("#inputLocation").value;
			const tags = document.querySelector("#inputTags").value;
			// console.log(Group);
			// console.log(movie);
			rhit.fbGroupsManager.add(name, seller, location, endTime, tags);
		});

		$('#addGroupDialog').on('show.bs.modal', (event) => {
			// pre-animation
			document.querySelector("#inputName").value = "";
			document.querySelector("#inputSeller").value = "";
			document.querySelector("#inputTime").value = "";
			document.querySelector("#inputLocation").value = "";
			document.querySelector("#inputTags").value = "";

		});

		$('#addGroupDialog').on('shown.bs.modal', (event) => {
			// post-animation
			document.querySelector("#inputName").focus();
		});

		// start listening
		rhit.fbGroupsManager.beginListening(this.updateList.bind(this));
	}

	_createCard(group) {
		// <div class="card">
		// 	<div class="card-body">
		//   		<h5 class="card-title">${movieGroup.Group}</h5>
		//   		<h6 class="card-subtitle mb-2 text-muted">${movieGroup.movie}</h6>
		// 	</div>
		//   </div>

		let owner = null;
		firebase.firestore().collection(rhit.FB_COLLECTION_USERS)
			.where("userName", "==", group.owner)
			.onSnapshot((querySnapshot) => {
				console.log("fetch group owner name");
				this._documentSnapshots = querySnapshot.docs;
				console.log('length :>> ', this._documentSnapshots.length);
				querySnapshot.forEach((doc) => {
					console.log(doc.id, " => ", doc.get(rhit.FB_KEY_USERS_NAME));
					owner = doc.get(rhit.FB_KEY_USERS_NAME);
					// return;
				});
				// if (changeListener) {
				// 	changeListener();
				// }

			});

		// .get()
		// .then(function(querySnapshot) {
		// 	querySnapshot.forEach(function(doc) {
		// 		// doc.data() is never undefined for query doc snapshots
		// 		console.log(doc.id, " => ", doc.get(rhit.FB_KEY_USERS_NAME));
		// 		owner = doc.get(rhit.FB_KEY_USERS_NAME)
		// 	});
		// })
		// .catch(function(error) {
		// 	console.log("Error getting documents: ", error);
		// });
		console.log('owner :>> ', owner);
		return htmlToElement(`
		<div class="card border-secondary">
		<div class="card-header" id = "cardHeaderContianer">
			<span id = "card-title">${group.name}</span><span class="badge badge-secondary" style="font-size: 1.25em;"><i class="material-icons">groups</i>&nbsp; +3</span>
		  </div>
		<div class="card-body text-secondary">
			<span id="cardOwner" class="h5">${group.ownerName}</span>
			<br><br>
			<span id="cardTimeTag" > End Time:</span>
			<span id="cardTime" class="font-italic"> ${group.endTime}</span>
			<br><br>
			<span id="cardTime" class=""> Tags:</span>
			<span class="badge badge-pill badge-primary">${group.tags}</span>
		</div>
		</div>
		<br><br>
		`);
	}

	updateList() {
		// console.log("I need to update the list.");
		// console.log(`Num Groups = ${rhit.fbGroupsManager.length}`);
		// console.log("Ex Groups = ", rhit.fbGroupsManager.getMovieGroupAtIndex(0));

		// Make a new GroupListContainer
		const newList = htmlToElement('<div id="groupListContainer"></div>');
		// Fill it with Group cards using a loop
		for (let i = 0; i < rhit.fbGroupsManager.length; i++) {
			const group = rhit.fbGroupsManager.getGroupAtIndex(i);
			const newCard = this._createCard(group);

			newCard.onclick = (event) => {
				// console.log(`You clicked on ${mq.id}`);
				// rhit.storage.setMovieGroupId(mq.id);
				window.location.href = `/groupdetail.html?id=${group.id}`;
			};

			newList.appendChild(newCard);
		}
		// console.log(rhit.fbGroupsManager.length);

		// Remove the old qLC
		const oldList = document.querySelector("#groupListContainer");
		// console.log(newList);
		oldList.removeAttribute("id");
		oldList.hidden = true;
		// Put in the new qLC
		// console.log(oldList.parentElement);
		oldList.parentElement.appendChild(newList);
		// console.log(oldList.parentElement);
	}
}

rhit.Group = class {
	constructor(id, name, owner, ownerName, seller, location, endTime, tags) {
		this.id = id;
		this.name = name;
		this.owner = owner;
		this.ownerName = ownerName;
		this.seller = seller;
		this.location = location;
		this.endTime = endTime;
		this.status = "InProgress";
		this.members = null;
		this.tags = tags
	}
}

rhit.FbGroupsManager = class {
	constructor(uid) {
		// console.log("Created Group Manager");
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_GROUPS);
		this._unsubscribe = null;
	}
	add(name, seller, location, endTime, tags) {
		// Add a new document with a generated id.
		this._ref.add({
				[rhit.FB_KEY_GROUP_NAME]: name,
				[rhit.FB_KEY_GROUP_OWNER]: rhit.fbAuthManager.uid,
				[rhit.FB_KEY_GROUP_OWNERNAME]: rhit.fbUser.name,
				[rhit.FB_KEY_GROUP_SELLER]: seller,
				[rhit.FB_KEY_GROUP_LOCATION]: location,
				[rhit.FB_KEY_GROUP_ENDTIME]: endTime,
				[rhit.FB_KEY_GROUP_STATUS]: "InProgress",
				[rhit.FB_KEY_GROUP_MEMBERS]: null,
				[rhit.FB_KEY_GROUP_TAGS]: tags,
				[rhit.FB_KEY_GROUP_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref
			.orderBy(rhit.FB_KEY_GROUP_LAST_TOUCHED, "desc")
			.limit(50)
			.onSnapshot((querySnapshot) => {
				console.log("Group Update");
				this._documentSnapshots = querySnapshot.docs;
				console.log('length :>> ', this._documentSnapshots.length);
				querySnapshot.forEach((doc) => {
					console.log(doc.data());
				});
				if (changeListener) {
					changeListener();
				}

			});
	}
	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length;
	}
	getGroupAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		console.log(docSnapshot.get(rhit.FB_KEY_GROUP_ENDTIME), );
		const group = new rhit.Group(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_GROUP_NAME),
			docSnapshot.get(rhit.FB_KEY_GROUP_OWNER),
			docSnapshot.get(rhit.FB_KEY_GROUP_OWNERNAME),
			docSnapshot.get(rhit.FB_KEY_GROUP_SELLER),
			docSnapshot.get(rhit.FB_KEY_GROUP_LOCATION),
			docSnapshot.get(rhit.FB_KEY_GROUP_ENDTIME).toDate(),
			docSnapshot.get(rhit.FB_KEY_GROUP_TAGS),
		);
		return group;
	}
}

rhit.DetailPageController = class {
	constructor() {

		document.querySelector("#submitEditGroup").addEventListener("click", (event) => {
			const name = document.querySelector("#inputName").value;
			const seller = document.querySelector("#inputSeller").value;
			// const endTime = document.querySelector("#inputTime").value;
			var d = $('#inputTime').datetimepicker('getValue');
			const endTime = firebase.firestore.Timestamp.fromDate(d);
			const location = document.querySelector("#inputLocation").value;
			const tags = document.querySelector("#inputTags").value;
			rhit.fbSingleGroupManager.update(name, seller, location, endTime, "InProgress", ["Rose", "Mickey", "Jack"], tags);
		});

		$('#editGroupDialog').on('show.bs.modal', (event) => {
			// pre-animation
			document.querySelector("#inputName").value = rhit.fbSingleGroupManager.name;
			document.querySelector("#inputSeller").value = rhit.fbSingleGroupManager.seller;
			document.querySelector("#inputTime").value = rhit.fbSingleGroupManager.endTime;
			document.querySelector("#inputLocation").value = rhit.fbSingleGroupManager.location;
			document.querySelector("#inputTags").value = rhit.fbSingleGroupManager.tags;
			console.log('name :>> ', rhit.fbSingleGroupManager.name);
		});

		$('#editGroupDialog').on('shown.bs.modal', (event) => {
			// post-animation
			document.querySelector("#inputName").focus();
		});


		document.querySelector("#submitDeleteGroup").addEventListener("click", (event) => {
			rhit.fbSingleGroupManager.delete().then(function () {
				console.log("Document successfully deleted!");
				window.location.href = "/list.html";
			}).catch(function (error) {
				console.error("Error removing document: ", error);
			});
		});

		// console.log("Made the detail page controller");
		rhit.fbSingleGroupManager.beginListening(this.updateView.bind(this));
	}

	updateView() {
		// console.log("Update the view");
		// document.querySelector("#cardGroup").innerHTML = rhit.fbSingleGroupManager.Group;
		// document.querySelector("#cardMovie").innerHTML = rhit.fbSingleGroupManager.movie;
		document.querySelector("#cardName").innerHTML = rhit.fbSingleGroupManager.name;
		document.querySelector("#cardSeller").innerHTML = rhit.fbSingleGroupManager.seller;
		document.querySelector("#cardEndTime").innerHTML = rhit.fbSingleGroupManager.endTime;
		document.querySelector("#cardLocation").innerHTML = rhit.fbSingleGroupManager.location;
		document.querySelector("#cardTags").innerHTML = rhit.fbSingleGroupManager.tags;
	}
}

rhit.FbSingleGroupManager = class {
	constructor(groupId) {
		this._documentSnapshot = {};
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_GROUPS).doc(groupId);
		// console.log(`Listening to ${this._ref.path}`);
	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._documentSnapshot = doc;
				changeListener();
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
				// window.location.href = "/";
			}
		});
	}

	stopListening() {
		this._unsubscribe();
	}

	update(name, seller, location, endTime, status, members, tags) {
		this._ref.update({
				[rhit.FB_KEY_GROUP_NAME]: name,
				[rhit.FB_KEY_GROUP_SELLER]: seller,
				[rhit.FB_KEY_GROUP_LOCATION]: location,
				[rhit.FB_KEY_GROUP_ENDTIME]: endTime,
				[rhit.FB_KEY_GROUP_STATUS]: status,
				[rhit.FB_KEY_GROUP_MEMBERS]: members,
				[rhit.FB_KEY_GROUP_TAGS]: tags,
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(function () {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	}

	delete() {
		return this._ref.delete();
	}

	get name() {
		return this._documentSnapshot.get(rhit.FB_KEY_GROUP_NAME);
	}

	get owner() {
		return this._documentSnapshot.get(rhit.FB_KEY_GROUP_OWNER);
	}

	get seller() {
		return this._documentSnapshot.get(rhit.FB_KEY_GROUP_SELLER);
	}

	get endTime() {
		return this._documentSnapshot.get(rhit.FB_KEY_GROUP_ENDTIME).toDate();
	}

	get location() {
		return this._documentSnapshot.get(rhit.FB_KEY_GROUP_LOCATION);
	}

	get members() {
		return this._documentSnapshot.get(rhit.FB_KEY_GROUP_MEMBERS);
	}

	get status() {
		return this._documentSnapshot.get(rhit.FB_KEY_GROUP_STATUS);
	}

	get tags() {
		return this._documentSnapshot.get(rhit.FB_KEY_GROUP_TAGS);
	}

}

rhit.LoginPageController = class {
	constructor() {
		// console.log("You have created the login page controller.");
		document.querySelector("#rosefireButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
		}
	}
}



rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
		console.log("You have made the Auth Manager");
		// this._ref  = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);

		// this._unsubscribe = null;
	}
	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;

			let owner = null;
			firebase.firestore().collection(rhit.FB_COLLECTION_USERS)
			.where("userName", "==", this._user.uid)
			.onSnapshot((querySnapshot) => {
				console.log("fetch group owner name");
				this._documentSnapshots = querySnapshot.docs;
				console.log('length :>> ', this._documentSnapshots.length);
				querySnapshot.forEach((doc) => {
					console.log(doc.id, " => ", doc.get(rhit.FB_KEY_USERS_NAME));
					let name  =doc.get(rhit.FB_KEY_USERS_NAME);
					let username = doc.get(rhit.FB_KEY_USERS_USERNAME);
					let email = doc.get(rhit.FB_KEY_USERS_EMAIL);
					console.log('email :>> ', email);
					rhit.fbUser = new rhit.User(name, username, email);
					// return;
				});
				// if (changeListener) {
				// 	changeListener();
				// }

			});




			changeListener();
		});
	}
	signIn() {
		// console.log("TODO: Sign In");
		const currRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		let subscribe = null;
		Rosefire.signIn("5957e42e-e013-4f98-997f-1f181e75568b", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);
			// user = rfUser;



			//check user exists in our db


			// DONE: Use the rfUser.token with your server.
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
					alert('The token you provided is not valid.');
				} else {
					console.log("Custom Auth Error", errorCode, errorMessage);
				}


			});


			currRef.where("userName", "==", rfUser.username)
				.get()
				.then(function (querySnapshot) {
					console.log(querySnapshot.docs.length);
					if (querySnapshot.docs.length == 0) {
						console.log("adding user");
						rhit.fbUser = new rhit.User(rfUser.name, rfUser.username, rfUser.email);
						currRef.add({
								[rhit.FB_KEY_USERS_NAME]: rfUser.name,
								[rhit.FB_KEY_USERS_USERNAME]: rfUser.username,
								[rhit.FB_KEY_USERS_EMAIL]: rfUser.email,
								[rhit.FB_KEY_USERS_GROUPCOUNT]: 0,
								[rhit.FB_KEY_USERS_PHONENUMBER]: "000-000-0000",
								[rhit.FB_KEY_USERS_RATE]: 0,

							})
							.then(function (docRef) {
								console.log("Document written with ID: ", docRef.id);
							})
							.catch(function (error) {
								console.error("Error adding document: ", error);
							});
					}

				})
				.catch(function (error) {
					console.log("Error getting documents: ", error);
				});



			// console.log("there is no data");

			//  subscribe = currRef.where("userName", "==", rfUser.username)
			//  .get()
			// // .orderBy(rhit.FB_KEY_GROUP_LAST_TOUCHED, "desc")
			// .limit(50)
			// .onSnapshot((querySnapshot) => {
			// 	console.log("User Update");
			// 	console.log("auth sign in is", rhit.fbAuthManager.isSignedIn);
			// 	console.log("auth current is ", rhit.fbAuthManager._user);
			// 	this._documentSnapshots = querySnapshot.docs;
			// 	console.log('length :>> ', this._documentSnapshots.length);

			// 	//check if there is no this user and right now the user is not using this web
			// 	if(this._documentSnapshots.length == 0 ){
			// 		console.log("this user is", rfUser.name);
			// 		// this.add(rfUser.name, rfUser.username,rfUser.email);

			// currRef.add({
			// 			[rhit.FB_KEY_USERS_NAME]:rfUser.name,
			// 			[rhit.FB_KEY_USERS_USERNAME]:rfUser.username,
			// 			[rhit.FB_KEY_USERS_EMAIL]: rfUser.email,
			// 			[rhit.FB_KEY_USERS_GROUPCOUNT]:0,
			// 			[rhit.FB_KEY_USERS_PHONENUMBER]:"000-000-0000",
			// 			[rhit.FB_KEY_USERS_RATE]:0,

			// 		})
			// 		.then(function (docRef) {
			// 			console.log("Document written with ID: ", docRef.id);
			// 		})
			// 		.catch(function (error) {
			// 			console.error("Error adding document: ", error);
			// 		});
			// console.log("there is no data");
			// 	}


			// });

			// subscribe();

		});
		// subscribe();


	}



	signOut() {
		// this._user = null;
		firebase.auth().signOut().catch(function (error) {
			// An error happened.
			console.log("Sign Out Error");
		});
	}


	add(name, username, email) {
		// Add a new document with a generated id.
		this._ref.add({
				[rhit.FB_KEY_USERS_NAME]: name,
				[rhit.FB_KEY_USERS_USERNAME]: username,
				[rhit.FB_KEY_USERS_EMAIL]: email,
				[rhit.FB_KEY_USERS_GROUPCOUNT]: 0,
				[rhit.FB_KEY_USERS_PHONENUMBER]: "000-000-0000",
				[rhit.FB_KEY_USERS_RATE]: 0,


			})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
		// this.stopListening();
	}
	stopListening() {
		this._unsubscribe();
	}

	get isSignedIn() {
		return !!this._user;
	}

	get uid() {
		return this._user.uid;
	}
}


rhit.PersonalPageController = class {
	constructor() {

		document.querySelector("#menuAllGroups").addEventListener("click", (event) => {
			window.location.href = "/list.html";
		});

		document.querySelector("#menuMyProfile").addEventListener("click", (event) => {
			window.location.href = "/personal.html";
		});


		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});
	}

	updateRate(){};
}

rhit.FbPersonalManager = class {
	constructor() {
		console.log("created personal manager");
		this._user = null;
		console.log("You have made the personal Manager");
	}

	changeRate(newRate){};

}



rhit.checkForRedirects = function () {
	if (document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/list.html";
	}

	if (!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn) {
		window.location.href = "/";
	}
};

rhit.initializePage = function () {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	


	if (document.querySelector("#listPage")) {
		console.log(this.fbAuthManager._user);
		console.log("You are on list Page.");
		const uid = urlParams.get("uid");
		
	$("#inputTime").datetimepicker({
		startDate: new Date(),
		
	  }
	  );
		rhit.fbGroupsManager = new rhit.FbGroupsManager();
		new rhit.ListPageController(uid);
	}

	if (document.querySelector("#groupdetailPage")) {
		console.log("You are on detail Page.");
		// console.log(queryString);
		
		$("#inputTime").datetimepicker({
			startDate: new Date(),
			
		}
		);
		const groupId = urlParams.get("id");

		if (!groupId) {
			// console.log("Error: Missing mq id");
			window.location.href = "/list.html";
		}
		rhit.fbSingleGroupManager = new rhit.FbSingleGroupManager(groupId);
		new rhit.DetailPageController();
	}

	if (document.querySelector("#personalPage")) {
		console.log("You are on personal Page.");
		new rhit.PersonalPageController();
	}

	if (document.querySelector("#loginPage")) {
		console.log("You are on login Page.");
		new rhit.LoginPageController();
	}

};


/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");

	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		// console.log("auth change callback fired. TODO: check for redirects.");
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);

		// Check for redirects
		rhit.checkForRedirects();

		// Page initialization
		rhit.initializePage();
	});
};

rhit.main();