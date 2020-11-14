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
rhit.FB_KEY_GROUP_ITEMS = "Items";
rhit.FB_KEY_GROUP_NOTIFICATION = "NotificationTime";

rhit.FB_COLLECTION_USERS = "Users";
rhit.FB_KEY_USERS_NAME = "Name";
rhit.FB_KEY_USERS_EMAIL = "Email";
rhit.FB_KEY_USERS_GROUPCOUNT = "GroupCount";
rhit.FB_KEY_USERS_USERNAME = "userName";
rhit.FB_KEY_USERS_RATE = "Rate";
rhit.FB_KEY_USERS_PHONENUMBER = "PhoneNumber";


rhit.FB_COLLECTION_ITEMS = "ShoppingItems";
rhit.FB_KEY_ITEMS_PRICE = "Price";
rhit.FB_KEY_ITEMS_LINK = "Link";



rhit.fbGroupsManager = null;
rhit.fbSingleGroupManager = null;
rhit.fbAuthManager = null;
rhit.fbPersonalManager = null;
rhit.fbUser = null;
rhit.fbMemberItemManager = null;
rhit.fbUsersManager = null;
rhit.fbNotificationManager = null;

rhit.isInProg = false;
rhit.isInFin = false;


rhit.User = class {
	constructor(name, userName, Email) {
		this.name = name;
		this.username = userName;
		this.email = Email;
		this.groupCount = 0;
		this.phoneNumber = "000-000-0000";
		this.rate = 0;
	}

	// constructor(name, userName, groupCount, rate) {
	// 	this.name = name;
	// 	this.username = userName;
	// 	this.email = "";
	// 	this.groupCount = groupCount;
	// 	this.phoneNumber = "000-000-0000";
	// 	this.rate = rate;
	// }
}

rhit.FbUsersManager = class {
	constructor() {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		this._unsubscribe = null;
	}

	beginListening() {
		this._unsubscribe = this._ref
			.onSnapshot((querySnapshot) => {
				console.log("Find All Users");
				this._documentSnapshots = querySnapshot.docs;

			});
	}

	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length;
	}
	getUserByUid(user) {
		console.log(this._documentSnapshots);
		for (let i = 0; i < this._documentSnapshots.length; i++) {
			let uid = this._documentSnapshots[i].get(rhit.FB_KEY_USERS_USERNAME)
			if (uid == user) {
				const oldRate = parseFloat(this._documentSnapshots[i].get(rhit.FB_KEY_USERS_RATE));
				const oldCount = parseInt(this._documentSnapshots[i].get(rhit.FB_KEY_USERS_GROUPCOUNT));
				return [oldRate, oldCount];
			}
		}

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
			rhit.isInProg = false;
			rhit.isInFin = false;
			window.location.href = "/list.html";
		});

		document.querySelector("#menuMyInProGroups").addEventListener("click", (event) => {
			rhit.isInProg = true;
			rhit.isInFin = false;
			rhit.fbGroupsManager.beginListening(this.updateList.bind(this));
		});

		document.querySelector("#menuMyFinGroups").addEventListener("click", (event) => {
			rhit.isInFin = true;
			rhit.isInProg = false;
			rhit.fbGroupsManager.beginListening(this.updateList.bind(this));
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
				// console.log("fetch group owner name");
				this._documentSnapshots = querySnapshot.docs;
				// console.log('length :>> ', this._documentSnapshots.length);
				querySnapshot.forEach((doc) => {
					// console.log(doc.id, " => ", doc.get(rhit.FB_KEY_USERS_NAME));
					owner = doc.get(rhit.FB_KEY_USERS_NAME);
					// return;
				});
				// if (changeListener) {
				// 	changeListener();
				// }

			});

		return htmlToElement(`
		<div class="card border-secondary">
		<div class="card-header " id = "cardHeaderContianer">
			<span id="card-title-${group.id}" class = "card-title">${group.name}</span><span class="badge badge-secondary" style="font-size: 1.25em;"><i class="material-icons">groups</i>&nbsp; +${group.members.length}</span>
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

		// let group = rhit.fbNotificationManager.getNotiGroup();
		// console.log("I need to update the list.");
		// console.log(`Num Groups = ${rhit.fbGroupsManager.length}`);
		// console.log("Ex Groups = ", rhit.fbGroupsManager.getMovieGroupAtIndex(0));
		console.log("Is In Progress = ", rhit.isInProg);
		console.log("Is Finished = ", rhit.isInFin);

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
			const status = group.status;
			const owner = group.owner;
			console.log(status);
			if (rhit.isInProg) {
				if (status == "InProgress" && owner == rhit.fbAuthManager.uid) {
					newList.appendChild(newCard);
				}
			} else if (rhit.isInFin) {
				if (status == "Finished" && owner == rhit.fbAuthManager.uid) {
					newList.appendChild(newCard);
				}
			} else {
				newList.appendChild(newCard);
			}

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

		for(let k = 0; k<rhit.fbGroupsManager.length;k++){
			if(rhit.fbGroupsManager.getGroupAtIndex(k).status == "Finished"){
				document.querySelector(`#card-title-${rhit.fbGroupsManager.getGroupAtIndex(k).id}`).setAttribute("style", "background-color: red;");
			}
			
		}
	}
}

rhit.Group = class {
	constructor(id, name, owner, ownerName, seller, location, endTime, members, tags, status, notify) {
		this.id = id;
		this.name = name;
		this.owner = owner;
		this.ownerName = ownerName;
		this.seller = seller;
		this.location = location;
		this.endTime = endTime;
		this.members = members;
		this.tags = tags;
		this.status = status;
		this.notify = notify;
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
				[rhit.FB_KEY_GROUP_MEMBERS]: [rhit.fbAuthManager.uid],
				[rhit.FB_KEY_GROUP_ITEMS]: {
					[rhit.fbAuthManager.uid]: []
				},
				[rhit.FB_KEY_GROUP_TAGS]: tags,
				[rhit.FB_KEY_GROUP_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
				[rhit.FB_KEY_GROUP_NOTIFICATION]: firebase.firestore.Timestamp.fromDate(new Date(0, 1, 1)),
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
			.orderBy(rhit.FB_KEY_GROUP_ENDTIME, "desc")
			.limit(50)
			.onSnapshot((querySnapshot) => {
				console.log("Group Update");
				this._documentSnapshots = querySnapshot.docs;
				// console.log('length :>> ', this._documentSnapshots.length);
				// querySnapshot.forEach((doc) => {
				// console.log(doc.data());
				// });
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
		// console.log(docSnapshot.get(rhit.FB_KEY_GROUP_ENDTIME), );
		const group = new rhit.Group(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_GROUP_NAME),
			docSnapshot.get(rhit.FB_KEY_GROUP_OWNER),
			docSnapshot.get(rhit.FB_KEY_GROUP_OWNERNAME),
			docSnapshot.get(rhit.FB_KEY_GROUP_SELLER),
			docSnapshot.get(rhit.FB_KEY_GROUP_LOCATION),
			docSnapshot.get(rhit.FB_KEY_GROUP_ENDTIME).toDate(),
			docSnapshot.get(rhit.FB_KEY_GROUP_MEMBERS),
			docSnapshot.get(rhit.FB_KEY_GROUP_TAGS),
			docSnapshot.get(rhit.FB_KEY_GROUP_STATUS),
			docSnapshot.get(rhit.FB_KEY_GROUP_NOTIFICATION).toDate(),
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
			rhit.fbSingleGroupManager.update(name, seller, location, endTime, tags);
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

		document.querySelector("#submitAddItem").addEventListener("click", (event) => {
			// console.log("submit");
			const name = document.querySelector("#inputItemName").value;
			const price = document.querySelector("#inputItemPrice").value;
			const link = document.querySelector("#inputItemLink").value;
			// console.log(Group);
			// console.log(movie);
			let currentItemList = rhit.fbSingleGroupManager.items;
			// console.log(currentItemList);
			let memberList = currentItemList[rhit.fbAuthManager.uid];
			console.log(currentItemList);
			memberList.push(name);
			memberList.push(price);
			memberList.push(link);
			console.log(currentItemList);
			rhit.fbSingleGroupManager.addItem(currentItemList);
		});

		$('#addItemDialog').on('show.bs.modal', (event) => {
			// pre-animation
			document.querySelector("#inputItemName").value = "";
			document.querySelector("#inputItemPrice").value = "";
			document.querySelector("#inputItemLink").value = "";
		});


		document.querySelector("#submitMessageGroup").addEventListener("click", (event) => {
			// console.log("current status is ", rhit.fbSingleGroupManager.status);
			// TODO: Add Permission System
			rhit.fbSingleGroupManager.updateStatus("Finished");
			// rhit.fbAuthManager.updateNotifyTime();
			document.querySelector(`#card-title-${rhit.fbSingleGroupManager.id}`).setAttribute("style", "background-color: red;");

		});


		document.querySelector("#submitRatePerson").addEventListener("click", (event) => {
			const members = rhit.fbSingleGroupManager.members;
			for (let i = 0; i < members.length; i++) {
				if (rhit.fbSingleGroupManager.owner != members[i]) {
					const rateDiv = document.querySelector("#rate-" + members[i]);
					console.log(rateDiv);
					let nextRate = 0;
					const rates = rateDiv.getElementsByClassName("rate-input");
					for (let j = 0; j < rates.length; j++) {
						const rate = rates[j];
						if (rate.checked) {
							nextRate = rate.value;
						}
					}
					// console.log(rates.length);
					const oldInfo = rhit.fbUsersManager.getUserByUid(members[i]);
					const newRate = (oldInfo[0] * oldInfo[1] + parseInt(nextRate)) / (oldInfo[1] + 1);
					// const newRate = oldInfo[0];
					const newCount = oldInfo[1] + 1;
					console.log(`New Rate: ${newRate} and new Count: ${newCount}`);
					rhit.fbSingleGroupManager.changeRate(newCount, newRate, members[i]);
				}
			}


		});

		document.querySelector("#submitJoinGroup").addEventListener("click", (event) => {
			const memberId = rhit.fbAuthManager.uid;

			// console.log("member Id I am using is ", memberId);
			// TODO: Add Permission System
			let newList = rhit.fbSingleGroupManager.members;
			newList.push(memberId);
			let currentItemList = rhit.fbSingleGroupManager.items;
			let newMemberlist = [];
			currentItemList[memberId] = newMemberlist;
			// rhit.fbSingleGroupManager.updateMember();
			rhit.fbSingleGroupManager.updateMemberList(newList, currentItemList);
			// console.log(rhit.fbSingleGroupManager.members);
		});

		document.querySelector("#submitDropGroup").addEventListener("click", (event) => {
			const memberId = rhit.fbAuthManager.uid;
			let members = rhit.fbSingleGroupManager.members;
			let items = rhit.fbSingleGroupManager.items;
			console.log(items);
			delete items[memberId];
			console.log(items);
			const index = members.indexOf(memberId);
			// console.log(index);
			members.splice(index, 1);
			// TODO: Remove in Items as well
			rhit.fbSingleGroupManager.updateMemberList(members, items);
			// console.log(rhit.fbSingleGroupManager.members);
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
		rhit.fbUsersManager.beginListening();
		rhit.fbSingleGroupManager.beginListening(this.updateView.bind(this));

		// rhit.FbMemberItemManager.beginListening(updateView.bind(this));
	}

	_createItemCard(groupId, member) {


		let listItem = "";

		return listItem;
	}

	_createRateCard(name) {
		return htmlToElement(`<div class="rate" id="rate-${name}">
		<h6>${name}</h6>
		<input class = "rate-input" type="radio" id="star5-${name}" name="rate-${name}" value="5" />
		<label for="star5-${name}" title="text">5 stars</label>
		<input class = "rate-input"type="radio" id="star4-${name}" name="rate-${name}" value="4" />
		<label for="star4-${name}" title="text">4 stars</label>
		<input class = "rate-input" type="radio" id="star3-${name}" name="rate-${name}" value="3" />
		<label for="star3-${name}" title="text">3 stars</label>
		<input class = "rate-input" type="radio" id="star2-${name}" name="rate-${name}" value="2" />
		<label for="star2-${name}" title="text">2 stars</label>
		<input class = "rate-input" type="radio" id="star1-${name}" name="rate-${name}" value="1" />
		<label for="star1-${name}" title="text">1 star</label>
	  </div>`);
	}

	_createMemberCard(itemsString, member, collapseName) {
		return htmlToElement(`<div class="card-body">
		<div class="card">
		  <div class="card-header" id="headingTwo">
			<h5 class="mb-0">
			  <button id="remove" class="btn btn-link" onclick = rhit.removeMember('${member}');>
			  <i class="material-icons" >clear</i>
			  </button>
			  <button class="btn btn-link" data-toggle="collapse" data-target="#${collapseName}" aria-expanded="false"
				aria-controls=${collapseName}>
				${member}
			  </button>
			  <button class="btn btn-link" onclick = rhit.goTOPersonalInfo('${member}'); >
			  <i class="material-icons" >info</i>
			  </button>
			</h5>
		  </div>

		  <div id="${collapseName}" class="collapse show" aria-labelledby="headingTwo" data-parent="#${collapseName}">
			<div class="card-body">
			  <p class="card-text">
				<ul class="list-group list-group-flush">
				  ${itemsString}
				 
				</ul>
				<!-- <div class="row">
				  <div class = "col">Nike shoes</div>
				  <div class = "col">$50</div>
				</div> -->
			  </p>
			</div>
		  </div>
		</div>
	  </div>`);
	}


	updateView() {
		// console.log("Update the view");
		document.querySelector("#cardName").innerHTML = `Group Name: ${rhit.fbSingleGroupManager.name}`;
		document.querySelector("#cardSeller").innerHTML = `Seller Name: ${rhit.fbSingleGroupManager.seller}`;
		document.querySelector("#cardEndTime").innerHTML = `End Time: ${rhit.fbSingleGroupManager.endTime}`;
		document.querySelector("#cardLocation").innerHTML = `Pick-up Location: ${rhit.fbSingleGroupManager.location}`;
		document.querySelector("#cardTags").innerHTML = `Tag: ${rhit.fbSingleGroupManager.tags}`;

		if (rhit.fbSingleGroupManager.owner == rhit.fbAuthManager.uid) {
			document.querySelector("#item-fab").style.display = "inline";
			if (rhit.fbSingleGroupManager.status == "InProgress") {
				document.querySelector("#menuEdit").style.display = "flex";
				document.querySelector("#menuDelete").style.display = "flex";
				document.querySelector("#menuMessage").style.display = "flex";
			} else if (rhit.fbSingleGroupManager.status == "Finished") {
				document.querySelector("#menuRate").style.display = "flex";
			}

		} else if (rhit.fbSingleGroupManager.members.length == 0 || !rhit.fbSingleGroupManager.members.includes(rhit.fbAuthManager.uid)) {
			document.querySelector("#menuJoin").style.display = "flex";
			document.querySelector("#menuDrop").style.display = "none";

			document.querySelector("#item-fab").style.display = "none";
		} else if (rhit.fbSingleGroupManager.members.includes(rhit.fbAuthManager.uid)) {
			document.querySelector("#menuDrop").style.display = "flex";
			document.querySelector("#menuJoin").style.display = "none";

			document.querySelector("#item-fab").style.display = "inline";

		}

		console.log("member is ", rhit.fbSingleGroupManager.members);
		// Make a new GroupListContainer
		const newList = htmlToElement('<div id = "memberList"></div>');
		// Fill it with Group cards using a loop
		for (let i = 0; i < rhit.fbSingleGroupManager.members.length; i++) {
			// const group = rhit.fbGroupsManager.getGroupAtIndex(i);
			const name = rhit.fbSingleGroupManager.members[i];
			const itemManager = new rhit.FbMemberItemManager(rhit.fbSingleGroupManager.id, name);
			const items = rhit.fbSingleGroupManager.items;
			// const memberItem = items.get("zhangt4");
			console.log(typeof (items));
			console.log(name);
			console.log(items[name]);
			console.log('memberItem :>> ', items);
			let memberItem = items[name];
			let itemsString = "";
			let totalAmount = 0;
			console.log(memberItem);
			for (let j = 0; j < memberItem.length; j += 3) {
				totalAmount += parseInt(memberItem[j + 1]);
				if (memberItem[j + 2] != "") {
					console.log('memberItem[j+2] :>> ', memberItem[j + 2]);
					itemsString += `<li data-amount = "${j}" class="list-group-item ${name} ${rhit.fbSingleGroupManager.owner} groupItems" data-toggle="modal" data-target="#editItemDialog"" ><span class="close" data-amount = "${j}">X</span><span class="tagName"><a href="${memberItem[j+2]}" class="itemLink" target="_blank">${memberItem[j]}</a></span> <span>$${memberItem[j+1]}</span></li>`;
				} else {
					itemsString += `<li data-amount = "${j}" class="list-group-item ${name} ${rhit.fbSingleGroupManager.owner} groupItems" data-toggle="modal" data-target="#editItemDialog"" ><span class="close" data-amount = "${j}">X</span><span class="tagName">${memberItem[j]}</span> <span>$${memberItem[j+1]}</span></li>`;
				}
			}
			itemsString += `<li class="list-group-item" id="totalAmount"> <span></span><span>$Total: ${totalAmount}</span></li>`;
			console.log(itemsString);
			let collapseName = rhit.fbAuthManager.uid + name;
			const newCard = this._createMemberCard(itemsString, name, collapseName);

			newList.appendChild(newCard);
		}
		// console.log(rhit.fbGroupsManager.length);

		// Remove the old qLC
		const oldList = document.querySelector("#memberList");
		// console.log(newList);
		oldList.removeAttribute("id");
		oldList.hidden = true;
		// Put in the new qLC
		// console.log(oldList.parentElement);
		oldList.parentElement.appendChild(newList);
		// console.log(oldList.parentElement);
		oldList.remove();

		if(rhit.fbSingleGroupManager.status == "Finished"){
			document.querySelector("#cardName").setAttribute("style", "background-color: red;");
		}		

		//add listener to close button
		const temp = document.getElementsByClassName("close");
		const temp1 = document.getElementsByClassName("groupItems");

		// const tempLinks = document.getElementsByClassName("itemLink");
		// newCard.get
		console.log('temp :>> ', temp);
		console.log("temp length is ", temp.length);
		// temp.forEach((tag)=>{
		// 		tag.addEventListener("click", (event) => {
		// 			var div = tag.parentElement;
		// 			div.style.display = "none";
		// 		});
		// 	});

		for (let i = 0; i < temp.length; i++) {
			const tag = temp[i];

			// const currLink = temp[i];
			var div = tag.parentElement;
			const tagClass = div.className;
			console.log('tagClass :>> ', tagClass);
			var tagOwner = tagClass.split(' ')[1];
			console.log('tagOwner :>> ', tagOwner);

			var groupOwner = tagClass.split(' ')[2];
			console.log(groupOwner);

			if (groupOwner == rhit.fbAuthManager.uid && tagOwner != rhit.fbAuthManager.uid) {
				tag.style.display = "none";
			} else if (tagOwner != rhit.fbAuthManager.uid) {
				div.style.display = "none"
			}

			// div.addEventListener("click",(event)=>{

			// });
			console.log("try on modal");
		
			temp1[i].addEventListener("click", function (event) {
				// console.log(event.target);
				const tempTarget = event.target.children;
				console.log(tempTarget);
				const name = tempTarget[1];
				// console.log(name);
				let linkData = "";
				let nameData = "";
				console.log(name);
				if (name.children == null || name.children.length == 0) {
					nameData = name.innerHTML;
					console.log(nameData);
				}
				// console.log(name.children);
				else if (name.children.length != 0) {
					linkData = name.children[0];
					linkData = linkData.getAttribute("href");
					nameData = name.children[0].innerHTML;
				}
				const price = tempTarget[2];
				let priceData = price.innerHTML;

				priceData = parseInt(priceData.substring(1));
				// console.log(priceData);
				const tempIndex = $(event.target).data("amount");
				// console.log(tempIndex);
				document.querySelector("#itemOwner").innerHTML = tagOwner;
				document.querySelector("#itemIndex").innerHTML = tempIndex;
				document.querySelector("#inputItemEditName").value = nameData;
				document.querySelector("#inputItemEditPrice").value = priceData;
				document.querySelector("#inputItemEditLink").value = linkData;
				document.querySelector("#submitEditItem").addEventListener("click", (event) => {
					console.log("try to update");
					let newName = document.querySelector("#inputItemEditName").value;
					let newPrice = document.querySelector("#inputItemEditPrice").value;
					let newLink = document.querySelector("#inputItemEditLink").value;
					let thisOwner = document.querySelector("#itemOwner").innerHTML;
					let thisIndex = document.querySelector("#itemIndex").innerHTML
					console.log(thisOwner);
					console.log(parseInt(thisIndex));

					let oldItemList = rhit.fbSingleGroupManager.items;
					let oldOwnerList = oldItemList[thisOwner];
					console.log('oldOwnerList :>> ', oldOwnerList);
					oldOwnerList.splice(thisIndex, 3, newName, newPrice, newLink);
					console.log('oldOwnerList :>> ', oldOwnerList);
					console.log(oldItemList);
					rhit.fbSingleGroupManager.addItem(oldItemList);
				});

			});


			$('.groupItems').on('shown.bs.modal', (event) => {
				// pre-animation
				let children = event.target;
				console.log(children);


			});

			$(".groupItems a").click(function (e) {
				// Do something

				e.stopPropagation();
			});


			tag.addEventListener("click", (event) => {
				console.log('event.target :>> ', event.target.parentElement);
				const dataAmount = $(event.target).data("amount");
				console.log('dataAmount :>> ', dataAmount);
				let  thisOwner = event.target.parentElement.className.split(' ')[1];
				console.log(thisOwner);
				console.log(tagOwner);
				console.log(dataAmount);
				rhit.fbSingleGroupManager.deleteItem(thisOwner, dataAmount);
				div.style.display = "none";
				event.stopPropagation();
			});
		
		}

		const members = rhit.fbSingleGroupManager.members;
		for (let i = 0; i < members.length; i++) {
			if (members[i] != rhit.fbSingleGroupManager.owner) {
				// const memberName = rhit.fbSingleGroupManager.getName(members[i]);
				const newPerson = this._createRateCard(members[i]);
				console.log(newPerson);
				document.querySelector("#rateListContainer").appendChild(newPerson);
			}
		}




	}
}

rhit.Items = class {
	constructor(price, link) {
		// this.groupId = groupId;
		// this.owner = owener;
		this.link = link;
		this.price = price;

	}
}

rhit.FbMemberItemManager = class {
	constructor(groupId, member) {
		this.groupId = groupId;
		this.member = member;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_ITEMS);
		this._unsubscribe = null;
		rhit.fbSingleGroupManager.members
		this.items = [];

	}

	beginListening(changeListener) {
		this.items = [];
		this._unsubscribe = firestore().collection(rhit.FB_COLLECTION_ITEMS)
			.where("OwnerID", "==", this.member)
			.where("GroupID", "==", this.groupId)
			.onSnapshot((querySnapshot) => {
				console.log("fetch item owner name");
				this._documentSnapshots = querySnapshot.docs;
				console.log('length :>> ', this._documentSnapshots.length);
				querySnapshot.forEach((doc) => {
					console.log(doc.id, " => ", doc.get("Name"));
					let price = doc.get(rhit.FB_KEY_ITEMS_PRICE);
					console.log(doc.id, " => ", price);

					this.items.push(new rhit.Items(price, doc.get(rhit.FB_KEY_ITEMS_LINK)))

				});
				if (changeListener) {
					changeListener();
				}

			});
	}

	stopListening() {
		this._unsubscribe();
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


	changeRate(newCount, newRate, uid) {
		firebase.firestore().collection(rhit.FB_COLLECTION_USERS).where("userName", "==", uid)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach(function (doc) {
					// doc.data() is never undefined for query doc snapshots
					console.log(doc.id, " => ", doc.data());

					firebase.firestore().collection(rhit.FB_COLLECTION_USERS).doc(doc.id).update({
							[rhit.FB_KEY_USERS_GROUPCOUNT]: newCount,
							[rhit.FB_KEY_USERS_RATE]: newRate,
						})
						.then(function () {
							console.log("Document successfully updated!");
						})
						.catch(function (error) {
							console.error("Error updating document: ", error);
						});
				});
			})
			.catch(function (error) {
				console.log("Error getting documents: ", error);
			});
	}

	stopListening() {
		this._unsubscribe();
	}

	update(name, seller, location, endTime, tags) {
		this._ref.update({
				[rhit.FB_KEY_GROUP_NAME]: name,
				[rhit.FB_KEY_GROUP_SELLER]: seller,
				[rhit.FB_KEY_GROUP_LOCATION]: location,
				[rhit.FB_KEY_GROUP_ENDTIME]: endTime,
				[rhit.FB_KEY_GROUP_TAGS]: tags,
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
				[rhit.FB_KEY_GROUP_NOTIFICATION]: firebase.firestore.Timestamp.fromDate(new Date(0, 1, 1)),
			})
			.then(function () {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	}

	deleteItem(name, index) {
		let items = rhit.fbSingleGroupManager.items;
		console.log('items :>> ', items);
		console.log('items[name] :>> ', items[name]);
		console.log('index :>> ', index);
		console.log(typeof (items[name]));
		// let test = ["iphone", "300", "haha", "try", "try", "try"];
		items[name].splice(index, 3);
		// console.log(test);
		// test.splice(0, 3)
		// console.log(test);
		console.log('newItems :>> ', items[name]);
		console.log(items);
		// console.log('items[name] :>> ', items[name]);
		// console.log('items :>> ', items);

		this._ref.update({
			[rhit.FB_KEY_GROUP_ITEMS]: items,
		})

	}

	addItem(items) {
		this._ref.update({
				// [rhit.FB_KEY_GROUP_MEMBERS]: members,
				// [rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
				[rhit.FB_KEY_GROUP_ITEMS]: items,
			}).then(function () {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	}

	updateMemberList(members, items) {
		this._ref.update({
				[rhit.FB_KEY_GROUP_MEMBERS]: members,
				// [rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
				[rhit.FB_KEY_GROUP_ITEMS]: items,
			}).then(function () {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	}

	updateMember(members) {
		this._ref.update({
				[rhit.FB_KEY_GROUP_MEMBERS]: members,
				// [rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(function () {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	}

	updateStatus(status) {
		this._ref.update({
				[rhit.FB_KEY_GROUP_STATUS]: status,
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(function () {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	}

	updateNotifyTime() {
		this._ref.update({
				[rhit.FB_KEY_GROUP_NOTIFICATION]: firebase.firestore.Timestamp.now() + 10000,
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

	get id() {
		return this._documentSnapshot.id;
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

	get notifyTime() {
		return this._documentSnapshot.get(rhit.FB_KEY_GROUP_NOTIFICATION).toDate();
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

	get items() {
		return this._documentSnapshot.get(rhit.FB_KEY_GROUP_ITEMS);;
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

			if (this._user) {
				let owner = null;
				firebase.firestore().collection(rhit.FB_COLLECTION_USERS)
					.where("userName", "==", this._user.uid)
					.onSnapshot((querySnapshot) => {
						console.log("fetch group owner name");
						this._documentSnapshots = querySnapshot.docs;
						console.log('length :>> ', this._documentSnapshots.length);
						querySnapshot.forEach((doc) => {
							console.log(doc.id, " => ", doc.get(rhit.FB_KEY_USERS_NAME));
							let name = doc.get(rhit.FB_KEY_USERS_NAME);
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
			}


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

	get user() {
		return this._user;
	}

	get uid() {
		return this._user.uid;
	}
}


rhit.PersonalPageController = class {
	constructor() {

		console.log("Created personal controller");

		document.querySelector("#menuAllGroups").addEventListener("click", (event) => {
			rhit.isInProg = false;
			rhit.isInFin = false;
			window.location.href = "/list.html";
		});

		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});

		rhit.fbPersonalManager.beginListening(this.updateRate.bind(this));
	}

	updateRate() {

		const newContainer = htmlToElement('<div id="personalInfoContainer"></div>');
		const name = rhit.fbPersonalManager.name;
		const number = rhit.fbPersonalManager.number;
		const email = rhit.fbPersonalManager.email;
		console.log(name, number, email);
		const newPersonalCard = this._createPersonalCard(name, number, email);
		newContainer.appendChild(newPersonalCard);

		const oldContainer = document.querySelector("#personalInfoContainer");
		oldContainer.removeAttribute("id");
		oldContainer.hidden = true;

		oldContainer.parentElement.appendChild(newContainer);
		oldContainer.remove();


		document.querySelector("#submitEditProfile").addEventListener("click", (event) => {
			const number = document.querySelector("#inputNumber").value;
			const email = document.querySelector("#inputEmail").value;
			console.log(`update number: ${number} and email: ${email} for user ${rhit.fbPersonalManager.name}`);
			rhit.fbPersonalManager.update(number, email);
		});
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const userId = urlParams.get("id");
		if (userId && userId != rhit.fbAuthManager.uid) {
			console.log("cannot see");
			document.querySelector("#EditProfileButton").style.display = "none";
		}

		document.querySelector("#EditProfileButton").addEventListener("click", (event) => {
			console.log("get");
			document.querySelector("#inputNumber").value = rhit.fbPersonalManager.number;
			document.querySelector("#inputEmail").value = rhit.fbPersonalManager.email;
			document.querySelector("#inputNumber").focus();
		});
	}

	_createPersonalCard(name, number, email) {
		return htmlToElement(`
		<div id="personalCard" class="card">
		<div id="box">
		  <div id="infobox">
			<h2 id="userName">${name}</h2>
			<p id="userRating"><strong>Rating: </strong>
			<a href="#">
			  <span class="fa fa-star"></span>
			</a>
			<a href="#">
			  <span class="fa fa-star"></span>
			</a>
			<a href="#">
			  <span class="fa fa-star"></span>
			</a>
			<a href="#">
			  <span class="fa fa-star"></span>
			</a>
			<a href="#">
			  <span class="fa fa-star-o"></span>
			</a>
		  </p>
			<p id="userPhone"><strong>Phone Number: </strong> ${number} </p>
			<p id="userEmail"><strong>Email: </strong> ${email} </p>
		  </div>
		</div>

		<div id="buttonbox">
			<p><button id="EditProfileButton" type="button" class="btn" data-toggle="modal" data-target="#editProfileDialog">Edit My Profile&nbsp;&nbsp;</button></p>
	  	</div>

		</div>
		`);
	}
}

rhit.FbPersonalManager = class {
	constructor(user) {
		console.log("created personal manager");
		this._user = user;
		this.name = null;
		this.username = null;
		this.email = null;
		this.number = null;
		this._unsubscribe = null;
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		// console.log("You have made the personal Manager for user", this._user.uid);
	}

	beginListening(changeListener) {
		console.log(this._user);
		if (this._user) {
			if (!this._user.uid) {
				this._unsubscribe = this._ref
					.where("userName", "==", this._user)
					.onSnapshot((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							this.name = doc.get(rhit.FB_KEY_USERS_NAME);
							this.username = doc.get(rhit.FB_KEY_USERS_USERNAME);
							this.email = doc.get(rhit.FB_KEY_USERS_EMAIL);
							this.number = doc.get(rhit.FB_KEY_USERS_PHONENUMBER);
						});
						if (changeListener) {
							changeListener();
						}
					});

			} else {
				this._unsubscribe = this._ref
					.where("userName", "==", this._user.uid)
					.onSnapshot((querySnapshot) => {
						querySnapshot.forEach((doc) => {
							this.name = doc.get(rhit.FB_KEY_USERS_NAME);
							this.username = doc.get(rhit.FB_KEY_USERS_USERNAME);
							this.email = doc.get(rhit.FB_KEY_USERS_EMAIL);
							this.number = doc.get(rhit.FB_KEY_USERS_PHONENUMBER);
						});
						if (changeListener) {
							changeListener();
						}
					});

			}

		}
	}

	stopListening() {
		this._unsubscribe();
	}

	update(number, email) {
		console.log(this._user.uid);
		this._ref.where("userName", "==", this._user.uid)
			.get()
			.then((querySnapshot) => {
				querySnapshot.forEach(function (doc) {
					// doc.data() is never undefined for query doc snapshots
					console.log(doc.id, " => ", doc.data());
					firebase.firestore().collection(rhit.FB_COLLECTION_USERS).doc(doc.id).update({
							[rhit.FB_KEY_USERS_PHONENUMBER]: number,
							[rhit.FB_KEY_USERS_EMAIL]: email,
						})
						.then(function () {
							console.log("Document successfully updated!");
						})
						.catch(function (error) {
							console.error("Error updating document: ", error);
						});
				});
			})
			.catch(function (error) {
				console.log("Error getting documents: ", error);
			});
	}

};

rhit.goTOPersonalInfo = function (memberId) {
	console.log("button clicked !", memberId);
	window.location.href = `/personal.html?id=${memberId}`;
}

rhit.removeMember = (memberId) => {
	if (rhit.fbSingleGroupManager.owner != rhit.fbAuthManager.uid) {
		return;
	}
	if (rhit.fbAuthManager.uid == memberId) {
		return;
	}
	console.log("remove ", memberId);
	let members = rhit.fbSingleGroupManager.members;
	let items = rhit.fbSingleGroupManager.items;
	delete items[memberId];
	const index = members.indexOf(memberId);
	members.splice(index, 1);
	rhit.fbSingleGroupManager.updateMemberList(members, items);
}

rhit.checkForNotification = () => {
	// if (rhit.notificationManager.isOn) {

	if (rhit.fbNotificationManager) {
		console.log("object");
		group = rhit.fbNotificationManager.getNotiGroup();
	}
	// rhit.notifyFinished(group);
	// }
};


rhit.checkForRedirects = () => {
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
		console.log("You are on list Page.");
		const uid = urlParams.get("uid");

		$("#inputTime").datetimepicker({
			startDate: new Date(),

		});
		rhit.fbGroupsManager = new rhit.FbGroupsManager();
		new rhit.ListPageController(uid);
	}

	if (document.querySelector("#groupdetailPage")) {
		console.log("You are on detail Page.");
		// console.log(queryString);

		$("#inputTime").datetimepicker({
			startDate: new Date(),

		});
		const groupId = urlParams.get("id");

		if (!groupId) {
			// console.log("Error: Missing mq id");
			window.location.href = "/list.html";
		}
		rhit.fbSingleGroupManager = new rhit.FbSingleGroupManager(groupId);
		rhit.fbUsersManager = new rhit.FbUsersManager();
		new rhit.DetailPageController();
	}

	if (document.querySelector("#personalPage")) {
		console.log("You are on personal Page.");
		let user = rhit.fbAuthManager.user;
		const userId = urlParams.get("id");

		if (userId && userId != user.uid) {
			// console.log("Error: Missing mq id");
			user = userId;
		}
		rhit.fbPersonalManager = new rhit.FbPersonalManager(user);
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