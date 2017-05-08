'use strict';

var products;

// Set background colr to gray of the searched results
function addGrayCover () {
	let searchRes = document.getElementById('search');
	if(searchRes){
		searchRes.previousElementSibling.classList.remove('hidden');
	}
}

// Remove gray background color of the searched results
function removeGrayCover () {
	let searchContainer = document.getElementById('searchContainer');
	document.getElementById('searchContainer').children[0].classList.add('hidden');
}

// Show the autocomplete suggestions based on the input
function autocomplete(e){
	let target, fragment, filtered;
	let autocompleteList = document.getElementById('autocompleteList');

	target = e.target.value.toLowerCase();
	addGrayCover();

	// Clear previous autocomplete suggestions
	if(autocompleteList){
		document.getElementById('autocompleteContainer').removeChild(autocompleteList);	
		// Remove all children of the list
		removeChildren(autocompleteList);
	}

	if(target === ''){
		document.getElementById('autocompleteContainer').removeChild(autocompleteList);	
		return;
	}

	filtered = products.filter(product => {
		return product.name.toLowerCase().startsWith(target);
	}).slice(0, 10); // At most show 10 items in the autocomplete sugggestions list

	if(filtered.length > 0){
		// Create the autocomplete suggestions
		autocompleteList = document.createElement('ul');
		autocompleteList.id = 'autocompleteList';	
		document.getElementById('autocompleteContainer').appendChild(autocompleteList);	

		filtered.forEach(product => {
			let item = document.createElement('li');
			item.dataset.name = product.name;
			item.innerHTML = hightlight(product.name, target);

			autocompleteList.appendChild(item);
		});
	}
}

// Remove children of an element
function removeChildren (autocompleteList) {
	let firstItem = autocompleteList.firstChild;
	while(firstItem){
		autocompleteList.removeChild(firstItem);
		firstItem = autocompleteList.firstChild;
	}
}

// Highight the differences in the autocomplete suggestions.
function hightlight (productName, target) {
	if(!productName){
		return;
	}	

	let targetLen = target.length, hightlighted = '', index;
	index = productName.toLowerCase().indexOf(target);
	if(index !== -1){ // Highlight the differences
		productName = productName.substring(0, targetLen) + productName.substring(targetLen).bold();
	}

	return productName;
}

// Send request to fetch products data
function fetchProduct(){
	var url = 'products.json';
	var xhr = new XMLHttpRequest();
	xhr.onload = () => {
		if(xhr.readyState === 4 && xhr.status === 200){
			products = JSON.parse(xhr.responseText).products;

			// Remove duplicate from the product data. 
			products = products.filter((thing, index, self) => self.findIndex((t) => {return t.type === thing.type && t.name === thing.name; }) === index);
		}
	};

	xhr.onerror = () => {
		console.log("Error!");
	};

	xhr.open('GET', url);
	xhr.send();
}

// When selects one item from the autocomplete suggestions, show it in the input field.
// And show the search result.
function onSelectSuggestion(e) {
	let target = e.target;
	if(target.nodeName === 'B'){
		target = target.parentElement;
	}

	if(target.nodeName === 'LI'){
		let searchName = target.dataset.name;
		document.getElementById('autocompleteInput').value = searchName;
		selectSuggestion(searchName);
	}

}

function selectSuggestion(searchName){
	let autocompleteList = document.getElementById('autocompleteList');
	if(autocompleteList){
		// Remove all children of the list
		removeChildren(autocompleteList);
		document.getElementById('autocompleteContainer').removeChild(autocompleteList);				
	}

	// List search results
	listSearchResults(searchName.toLowerCase());
}

// Highlight the suggestion when hover it
function hoverItem (e) {
	let target = e.target;
	if(target.nodeName === 'B'){
		target = target.parentElement;
	}

	if(target.nodeName === 'LI'){
		let hightlighted = document.querySelector('#autocompleteList .highlighted');
		target.classList.add('highlighted');
	}
}

// Unhighlight a suggestion when it is not hovered
function unhoverItem (e) {
	let target = e.target;
	if(target.nodeName === 'B'){
		target = target.parentElement;
	}

	if(target.nodeName === 'LI'){
		target.classList.remove('highlighted');
	}
}

// List the search result
function listSearchResults (target) {
	let searchRes, filtered, container, header, productHeader, typeHeader;

	// Clear previous result
	searchRes = document.getElementById('search');
	if(searchRes){
		document.getElementById('searchContainer').removeChild(searchRes);	
		removeChildren(searchRes);
	}

	// Remove the gray cover once there is a new search result
	removeGrayCover();

	filtered = products.filter(product => {
		return product.name.toLowerCase().includes(target);
	});

	if(filtered.length > 0){
		// Create table
		searchRes = document.createElement('table');
		searchRes.id = 'search';
		document.getElementById('searchContainer').appendChild(searchRes);	

		// Append header to table
		header = document.createElement('tr');
		productHeader = document.createElement('th');
		productHeader.appendChild(document.createTextNode('Product'));
		typeHeader = document.createElement('th');
		typeHeader.appendChild(document.createTextNode('Type'));
		header.appendChild(productHeader);
		header.appendChild(typeHeader);
		searchRes.appendChild(header);

		// Append each search result as a row of a table
		filtered.forEach(product => {
			let item = document.createElement('tr');
			let productName = document.createElement('td');
			let link = document.createElement('a');
			link.href = product.url;
			link.appendChild(document.createTextNode(product.name));
			productName.appendChild(link);

			let productType = document.createElement('td');
			productType.appendChild(document.createTextNode(product.type));

			item.appendChild(productName);
			item.appendChild(productType);

			searchRes.appendChild(item);
		});	
	}
}

// Navigate up/down throug the autocomplete suggestions
function navigate (e) {
	if(e.keyCode === 38){ // Up key
		let highlighted = document.querySelector('#autocompleteList .highlighted');	
		console.log(highlighted);

		if(highlighted){ // Highlight the previus suggestion
			let preItem = highlighted.previousElementSibling;
			highlighted.classList.remove('highlighted');
			if(preItem){
				preItem.classList.add('highlighted');
			}
		}		
		
		updateInputDynamically();

	}
	else if(e.keyCode === 40){ // Down key
		let autocompleteSuggestions =  document.getElementById('autocompleteList');

		if(autocompleteSuggestions){
			let highlighted = document.querySelector('#autocompleteList .highlighted');	

			let lists = autocompleteSuggestions.children;

			if(!highlighted){
				// Highlight the first suggestion in the list
				lists[0].classList.add('highlighted');
			}
			else{ // Highlight the next suggestion
				let nextItem = highlighted.nextElementSibling;
				if(nextItem){
					highlighted.classList.remove('highlighted');
					nextItem.classList.add('highlighted');
				}
			}

			updateInputDynamically();
		}
	}
	// When user selects a suggestion with ENTER key, show the search result.
	else if(e.keyCode === 13){
		if(e.target.id === 'autocompleteInput'){
			let searchName = e.target.value;

			selectSuggestion(searchName);
		}
	}
}

// Update the input value with autocomplete suggestion dynamically
function updateInputDynamically(){
	let highlighted = document.querySelector('#autocompleteList .highlighted');
	if(highlighted){
		let searchName = highlighted.dataset.name;
		document.getElementById('autocompleteInput').value = searchName;			
	}
}

window.onload = () => {
		let autocompleteContainer = document.getElementById('autocompleteContainer');
		// Fetch product data
		fetchProduct();

		document.getElementById('autocompleteInput').addEventListener('input', autocomplete);
		autocompleteContainer.addEventListener('click', onSelectSuggestion);
		autocompleteContainer.addEventListener('mouseover', hoverItem);
		autocompleteContainer.addEventListener('mouseout', unhoverItem);
		document.body.addEventListener('keydown', navigate);
}