
var database = null;
var groceryInfoArray = [];

$(document).ready(function() {
	// a variable to reference the database.
	database = initializeFirebase();
	getGroceryInfoFromDatabase();
	cancelGroceryUpdateFormSubmissionEventListener();
	addGroceryItemFormSubmissionEventListener();
	displayGroceryInfoTable();
	clearGroceryForm();
	updateGroceryItemInfoPencilSquareIconClickListener();
	deleteGroceryItemInfoTrashIconClickListener();
	// seedData();
});

function initializeFirebase() {
	var config = {
	    apiKey: "AIzaSyB36tz7lq1erlcNxk0h99zTkBWt86sZtfU",
	    authDomain: "grocery-item-listing.firebaseapp.com",
	    databaseURL: "https://grocery-item-listing.firebaseio.com",
	    projectId: "grocery-item-listing",
	    storageBucket: "",
	    messagingSenderId: "753753717406"
	};
	firebase.initializeApp(config);
	return firebase.database();
}

function deleteGroceryItemInfoTrashIconClickListener() {
    $(document).on("click", "i.fa-trash", function() {
    	var databaseKey = $(this).attr("data-key");
		database.ref().child(databaseKey).remove();
	});
}

function updateGroceryItemInfoPencilSquareIconClickListener() {
    $(document).on("click", "i.fa-pencil-square-o", function() {
    	var databaseKey = $(this).attr("data-key");
    	var groceryItemToUpdate = getGroceryItem(databaseKey);
		modifyFormForUpdateGroceryItemInfo(groceryItemToUpdate);
	});
}

function getGroceryItem(databaseKey) {
	for (var i=0; i<groceryInfoArray.length; i++) {
		var currentGroceryItem = groceryInfoArray[i];
		if (currentGroceryItem.databaseKey === databaseKey) {
			return currentGroceryItem;
		}
	}
}

function modifyFormForUpdateGroceryItemInfo(groceryItemToUpdate) {
	$("#grocery-add-update").text("Update Grocery Item");

	$("#grocery-item-name").val(groceryItemToUpdate.groceryItemName);
	$("#notes").val(groceryItemToUpdate.notes);
	$("#databaseKey").val(groceryItemToUpdate.databaseKey);

	$("#cancel-grocery-info-update").show();
}

function cancelGroceryUpdateFormSubmissionEventListener() {
	$("#cancel-grocery-info-update").on("click", function(event) {
		event.preventDefault();
		clearGroceryForm();
	});
}

function addGroceryItemFormSubmissionEventListener() {
	$("#submit-grocery-info").on("click", function(event) {
		event.preventDefault();

		var groceryItem = {};
		groceryItem.groceryItemName = $("#grocery-item-name").val().trim();
		groceryItem.notes = $("#notes").val().trim();
		//by default, we assume that when grocery items are first added to the list
		//they are not purchased yet
		groceryItem.isPurchased = false;
		
		var databaseKey = $("#databaseKey").val().trim();

		var isGroceryItemNameNonEmptyAndUnique = true;
		var isGroceryItemNotesNonEmpty = true;

		if (!uniqueNonEmptyGroceryItemName(databaseKey, groceryItem.groceryItemName) || !validNonEmptyNotes(groceryItem.notes)) {
			if (!uniqueNonEmptyGroceryItemName(databaseKey, groceryItem.groceryItemName)) {
				isGroceryItemNameNonEmptyAndUnique = false;
			}
			if (!validNonEmptyNotes(groceryItem.notes)) {
				isGroceryItemNotesNonEmpty = false;
			}
			showFormInputFeedback(false, isGroceryItemNameNonEmptyAndUnique, isGroceryItemNotesNonEmpty);
		} else {	
			clearGroceryForm();
			if (databaseKey) {
				// if databaseKey is NOT null then we are updating an existing grocery item's info
				updateGroceryItemInfoToDatabase(databaseKey, groceryItem);
			} else {
				addGroceryItemInfoToDatabase(groceryItem);
			}
		}
	});
}

function uniqueNonEmptyGroceryItemName(databaseKey, groceryItemName) {
	if (!groceryItemName) {
		return false;
	}
	for (var i=0; i< groceryInfoArray.length; i++) {
		if (groceryItemName === groceryInfoArray[i].groceryItemName) {
			// if the grocery item name exists and databaseKey is NOT null (i.e., we are updating an existing grocery item's information)
			// then return true to indicate that the grocery item name is unique
			if (databaseKey) {
				return true;
			}
			return false;
		}
	}
	return true;
}

function validNonEmptyNotes(notes) {
	return !(notes === "");
}

function showFormInputFeedback(hideFormInputFeedback, isGroceryItemNameNonEmptyAndUnique, isGroceryItemNotesNonEmpty) {
	var groceryItemNameFeedbackContainer = $("#grocery-item-name-feedback");
	var notesFeedbackContainer = $("#notes-feedback");

	if (hideFormInputFeedback) {
		groceryItemNameFeedbackContainer.text("");
		notesFeedbackContainer.text("");
		return;
	}

	if (!isGroceryItemNameNonEmptyAndUnique) {
		groceryItemNameFeedbackContainer.text("Please input a non-empty unique train name that is not already listed in the table above");
	} else {
		groceryItemNameFeedbackContainer.text("");
	}

	if (!isGroceryItemNotesNonEmpty) {
		notesFeedbackContainer.text("Please input a non-empty train destination");
	} else {
		notesFeedbackContainer.text("");
	}
}

function clearGroceryForm() {
	$("#grocery-add-update").text("Add Grocery Item");

	$("#grocery-item-name").val("");
	$("#notes").val("");
	$("#databaseKey").val("");
	showFormInputFeedback(true);

	$("#cancel-grocery-info-update").hide();
}

function displayGroceryInfoTable() {
	var tableBody = $("#grocery-table-body");
	tableBody.empty();
	groceryInfoArray.forEach(function(groceryItem){
		tableBody.append(generateGroceryItemHtml(groceryItem));
	});
}

function generateGroceryItemHtml(groceryItem) {
	var tableRow = $("<tr>");
	
	var groceryItemNameTableCell = $("<td>");
	groceryItemNameTableCell.text(groceryItem.groceryItemName);
	tableRow.append(groceryItemNameTableCell);
	
	var notesTableCell = $("<td>");
	notesTableCell.text(groceryItem.notes);
	tableRow.append(notesTableCell);

	var purchasedTableCell = $("<td>");
	purchasedTableCell.text(groceryItem.isPurchased);
	tableRow.append(purchasedTableCell);

	var updateGroceryItemInfoTableCell = $("<td>");
	updateGroceryItemInfoTableCell.html("<i data-key=\""+ groceryItem.databaseKey + "\" class=\"fa fa-pencil-square-o fa-2x\" aria-hidden=\"true\"></i>");
	tableRow.append(updateGroceryItemInfoTableCell);

	var deleteGroceryItemInfoTableCell = $("<td>");
	deleteGroceryItemInfoTableCell.html("<i data-key=\""+ groceryItem.databaseKey + "\" class=\"fa fa-trash fa-2x\" aria-hidden=\"true\"></i>");
	tableRow.append(deleteGroceryItemInfoTableCell);

	return tableRow;
}

function updateGroceryItemInfoToDatabase(databaseKey, groceryItem) {
	database.ref().child(databaseKey + "/groceryItem").update(groceryItem);
}

function addGroceryItemInfoToDatabase(groceryItem) {
	database.ref().push({
		groceryItem: groceryItem
	});
}

function getGroceryInfoFromDatabase() {
	database.ref().on("value", function(snapshot) {
		// We are now inside our .on function...

		// Update the value of our groceryInfoArray to match the info in the database
		groceryInfoArray = [];
		if (snapshot.val()) {			
			Object.keys(snapshot.val()).forEach(function(key){
				// console.log(snapshot.val()[key].groceryItem);
				var groceryItem = snapshot.val()[key].groceryItem;
				groceryItem.databaseKey = key;
				groceryInfoArray.push(groceryItem);
			});
		}

		// Change the HTML using jQuery to reflect the updated grocery info table
		displayGroceryInfoTable();
		console.log("groceryInfoArray length: " + groceryInfoArray.length);

	// If any errors are experienced, log them to console.
	}, function(errorObject) {
	  console.log("The read failed: " + errorObject);
	});
}

function seedData() {
	addGroceryItemInfoToDatabase({});
	addGroceryItemInfoToDatabase({});
	addGroceryItemInfoToDatabase({});
}


