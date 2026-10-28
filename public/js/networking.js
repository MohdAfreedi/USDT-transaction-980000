let vcns=JSON.parse(localStorage.getItem("vcns"))||[];

render();

function render(){

const table=document.getElementById("vcnTable");

table.innerHTML="";

vcns.forEach((vcn,index)=>{

table.innerHTML+=`

<tr>

<td>${vcn.name}</td>

<td>${vcn.cidr}</td>

<td>${vcn.region}</td>

<td class="${vcn.status=="Available"?"green":"orange"}">

${vcn.status}

</td>

<td>

<button onclick="deleteVCN(${index})">

Delete

</button>

</td>

</tr>

`;

});

}

function openPopup(){

document.getElementById("popup").style.display="flex";

}

function closePopup(){

document.getElementById("popup").style.display="none";

}

function createVCN(){

const vcn={

name:vcnName.value,

cidr:cidr.value,

region:region.value,

status:"Provisioning"

};

vcns.push(vcn);

render();

closePopup();

setTimeout(()=>{

vcn.status="Available";

render();

},3000);

}

function deleteVCN(index){

vcns.splice(index,1);

render();

}