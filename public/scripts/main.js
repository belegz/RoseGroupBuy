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
rhit.fbGroupsManager = null;
rhit.fbSingleGroupManager = null;

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}


rhit.ListPageController = class {
	constructor() {

		document.querySelector("#submitAddGroup").addEventListener("click", (event) => {
			// console.log("submit");
			const name = document.querySelector("#inputName").value;
			const seller = document.querySelector("#inputSeller").value;
			const endTime = document.querySelector("#inputTime").value;
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
		return htmlToElement(`
		<div class="card border-secondary">
		<div class="card-header" id = "cardHeaderContianer">
			<span id = "card-title">${group.name}</span><span class="badge badge-secondary" style="font-size: 1.25em;"><i class="material-icons">groups</i>&nbsp; +3</span>
		  </div>
		<div class="card-body text-secondary">
			<span id="cardOwner" class="h5">${group.owner}</span>
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
		console.log(rhit.fbGroupsManager.length);

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
	constructor(id, name, owner,seller, location, endTime, tags) {
		this.id = id;
		this.name = name;
		this.owner = owner;
		this.seller = seller;
		this.location = location;
		this.endTime = endTime;
		this.status = "InProgress";
		this.members = null;
		this.tags = tags
	}
}

rhit.FbGroupsManager = class {
	constructor() {
		// console.log("Created Group Manager");
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_GROUPS);
		this._unsubscribe = null;
	}
	add(name, seller, location, endTime, tags) {
		// Add a new document with a generated id.
		this._ref.add({
				[rhit.FB_KEY_GROUP_NAME]: name,
				[rhit.FB_KEY_GROUP_OWNER]: null,
				[rhit.FB_KEY_GROUP_SELLER]: seller,
				[rhit.FB_KEY_GROUP_LOCATION]: location,
				[rhit.FB_KEY_GROUP_ENDTIME]: endTime,
				[rhit.FB_KEY_GROUP_STATUS]: "InProgress",
				[rhit.FB_KEY_GROUP_MEMBERS]: null,
				[rhit.FB_KEY_GROUP_TAGS]: tags,
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
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
			// .orderBy(rhit.FB_KEY_GROUP_LAST_TOUCHED, "desc")
			.limit(50)
			.onSnapshot((querySnapshot) => {
				console.log("Group Update");
				this._documentSnapshots = querySnapshot.docs;
				console.log('length :>> ', this._documentSnapshots.length);
				querySnapshot.forEach((doc)  => {
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
		const group = new rhit.Group(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_GROUP_NAME),
			docSnapshot.get(rhit.FB_KEY_GROUP_OWNER),
			docSnapshot.get(rhit.FB_KEY_GROUP_SELLER),
			docSnapshot.get(rhit.FB_KEY_GROUP_LOCATION),
			docSnapshot.get(rhit.FB_KEY_GROUP_ENDTIME),
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
			const endTime = document.querySelector("#inputTime").value;
			const location = document.querySelector("#inputLocation").value;
			const tags = document.querySelector("#inputTags").value;
			rhit.fbSingleGroupManager.update(name, seller, location, endTime, "InProgress", ["Rose","Mickey","Jack"], tags);
		});

		$('#editGroupDialog').on('show.bs.modal', (event) => {
			// pre-animation
			document.querySelector("#inputName").value = rhit.fbSingleGroupManager.name;
			document.querySelector("#inputSeller").value = rhit.fbSingleGroupManager.seller;
			document.querySelector("#inputTime").value = rhit.fbSingleGroupManager.endTime;
			document.querySelector("#inputLocation").value = rhit.fbSingleGroupManager.location;
			document.querySelector("#inputTags").value = rhit.fbSingleGroupManager.tags;
		});

		$('#editGroupDialog').on('shown.bs.modal', (event) => {
			// post-animation
			document.querySelector("#inputName").focus();
		});


		document.querySelector("#submitDeleteGroup").addEventListener("click", (event) => {
			rhit.fbSingleGroupManager.delete().then(function () {
				console.log("Document successfully deleted!");
				window.location.href = "/";
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
		document.querySelector("#cardName").value = rhit.fbSingleGroupManager.name;
		document.querySelector("#cardSeller").value = rhit.fbSingleGroupManager.seller;
		document.querySelector("#cardEndTime").value = rhit.fbSingleGroupManager.endTime;
		document.querySelector("#cardLocation").value = rhit.fbSingleGroupManager.location;
		document.querySelector("#cardTags").value = rhit.fbSingleGroupManager.tags;
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
		return this._documentSnapshot.get(rhit.FB_KEY_GROUP_ENDTIME);
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



/* Main */
/** function and class syntax examples */
rhit.main = function () {
	console.log("Ready");

	if (document.querySelector("#listPage")) {
		console.log("You are on list Page.");
		rhit.fbGroupsManager = new rhit.FbGroupsManager();
		new rhit.ListPageController();
	}

	if (document.querySelector("#detailPage")) {
		console.log("You are on detail Page.");

		const queryString = window.location.search;
		console.log(queryString);
		const urlParams = new URLSearchParams(queryString);
		const groupId = urlParams.get("id");

		if (!groupId) {
			// console.log("Error: Missing mq id");
			window.location.href = "/";
		}
		rhit.fbSingleGroupManager = new rhit.FbSingleGroupManager(groupId);
		new rhit.DetailPageController();
	}


};

rhit.main();