var mapsList = [];

var mapsWorkspace = [];

var groups = [];

var bgColors = ["#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
"#0000A6", "#63FFAC", "#004D43", "#8FB0FF","#5A0007", "#809693", "#1B4400", "#4FC601"];

class WorkspaceMap {
  constructor(obj, copy) {
    this.metadata = {
      index: obj.index,
      title: obj.title,
      thumb: obj.thumb,
      description: obj.description,
      category: obj.category,
      post: obj.post,
      images: obj.images,
      video: obj.video,
      datasources: obj.datasources
    }

    this.dragging = false;
    this.grouped = false;

    // add it to the DOM
    this.element = this.createDOM(copy);
    this.element.appendTo('#workspace');
    this.dragElement();

    // make sure it's clickable
    this.element.on('mousedown', this.dragElement.bind(this)); // bind the whole object, rather than just the DOM element
  }

  createDOM(copy) {
    copy.empty()
    copy.removeClass('list-item');
    copy.addClass("workspace-item");
    copy.css("left", (window.event.clientX-50) + "px");
    copy.css("top", (window.event.clientY-50) + "px");
    return copy
  }

  checkBelow(x,y) {
    // check if element is overtop of another one
    let elementsBelow = document.elementsFromPoint(x, y)
    let mapsBelow = elementsBelow.filter(function(item) {
      return (item.className == "workspace-item"? true : false);
    });

    let groupsBelow = elementsBelow.filter(function(item) {
      return (item.className == "workspace-group"? true : false);
    });

    if (groupsBelow.length > 0) {
      var below = {
        match: "group",
        elems: groupsBelow
      }
      return below;
    } else {
      var below = {
        match: "map",
        elems: mapsBelow
      }
      return below;
    }
  }

  dragElement() {
    this.element.attr("id","dragging");
    this.element.addClass("active");
    this.dragging = true;
    var currentX = 0, currentY = 0, previousX = 0, previousY = 0;
    var e = window.event;
    // get the mouse cursor position at startup:
    previousX = e.clientX;
    previousY = e.clientY;

    document.onmousemove = elementDrag.bind(this); // call a function whenever the cursor moves:
    document.onmouseup = stopDraggingElement.bind(this); // stop the dragging

    function elementDrag(e) {
      e = e || window.event;
      // calculate the new cursor position:
      currentX = previousX - e.clientX;
      currentY = previousY - e.clientY;
      previousX = e.clientX;
      previousY = e.clientY;
      // set the element's new position:
      let elem = document.getElementById("dragging");
      elem.style.top = (elem.offsetTop - currentY) + "px";
      elem.style.left = (elem.offsetLeft - currentX) + "px";
    }

    function stopDraggingElement(e) {
      e = e || window.event;

      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;

      $('#dragging').removeClass('active');
      $('#dragging').attr("id", null);

      let itemsBelow = this.checkBelow(e.clientX, e.clientY);


      if (itemsBelow.match == "map") {

        var matchingMap;

        for (var i = 0; i < itemsBelow.elems.length; i++) {
          let id = (itemsBelow.elems[i].dataset.index).toString();

          if (id != this.metadata.index) {
            matchingMap = mapsWorkspace.filter(function(item) {
              return (item.metadata.index == id? true : false);
            });
          }
        }

        if (matchingMap != undefined) {
          console.log("create a new group");
          let group = new Group(bgColors[groups.length], this, matchingMap[0]);
          groups.push(group);
        }
      } else if (itemsBelow.match == "group") {
        console.log("add to existing group!");
        var index = parseInt(itemsBelow.elems[0].id);

        groups[index].addMap(this);
      }

      setTimeout(function() {
        this.dragging = false;
      },100);
    }
  }
}

class ListMap {

  constructor(obj) {
    this.metadata = {
      index: obj.id,
      title: obj.title,
      thumb: obj.img,
      description: obj.description,
      category: obj.category,
      post: obj.post,
      images: obj.images,
      video: obj.video,
      datasources: obj.datasources
    }

    // add it to the DOM
    this.element = this.createDom();
    this.element.appendTo('#list');

    // make sure it's clickable
    this.element.on('mousedown', this.mouseDown.bind(this)); // bind the whole object, rather than just the DOM element
  }

  createDom() {
    return $('<div/>', {
        "class": 'list-item',
        css: {
          "background-image": 'url("img/' + this.metadata.thumb + '")',
          // "background-color": color
        },
        "data-title": this.metadata.title,
        "data-index": this.metadata.index,
        "data-category": this.metadata.category,
    }).append("<h1>" + this.metadata.title + "</h1>");
  }

  mouseDown() {
    var copy = this.element.clone();

    let workspaceObj = new WorkspaceMap(this.metadata, copy);
    mapsWorkspace.push(workspaceObj);
  }
}

// function dragElement(e, element) {
//   var currentX = 0, currentY = 0, previousX = 0, previousY = 0;
//   e = e || window.event;
//   // get the mouse cursor position at startup:
//   previousX = e.clientX;
//   previousY = e.clientY;
//   // call a function whenever the cursor moves:
//   document.onmousemove = elementDrag;
//   // stop the dragging
//   document.onmouseup = stopDraggingElement;
//
//
//   function elementDrag(e) {
//     isDragging = true;
//
//     e = e || window.event;
//     // calculate the new cursor position:
//     currentX = previousX - e.clientX;
//     currentY = previousY - e.clientY;
//     previousX = e.clientX;
//     previousY = e.clientY;
//     // set the element's new position:
//     let elem = document.getElementById("dragging");
//     element.css({"top": (elem.offsetTop - currentY) + "px", "left": (elem.offsetLeft - currentX) + "px"});
//   }
//
//   function stopDraggingElement(e) {
//     e = e || window.event;
//
//     /* stop moving when mouse button is released:*/
//     document.onmouseup = null;
//     document.onmousemove = null;
//
//     $('#dragging').toggleClass('active');
//     if (!$('#dragging').hasClass('workspace-item')) {
//       $('#dragging').addClass('workspace-item');
//     }
//     $('#dragging').css("background-color", "#acacac");
//     $('#dragging').attr("id", null);
//
//     // check if element is overtop of another one
//     let elementsBelow = document.elementsFromPoint(e.clientX, e.clientY)
//     let otherItems = elementsBelow.filter(function(item) {
//       return (item.className == "workspace-item"? true : false);
//     });
//
//     if (otherItems.length > 0) {
//       element.css("border-color", "#aa22dd");
//
//       console.log(otherItems[0].offsetTop);
//       let offset = 10;
//       let yDifference = otherItems[0].offsetHeight - element.outerHeight();
//       let yPosition = otherItems[0].offsetTop - yDifference/2 + offset;
//       let xDifference = otherItems[0].offsetWidth - element.outerWidth();
//       let xPosition = otherItems[0].offsetLeft - xDifference/2 + offset;
//       element.css({"top": yPosition + "px", "left": xPosition + "px"});
//
//       // need to put a group wrapper around these?
//       for (let item of otherItems) {
//         item.style["border-color"] = "#aa22dd";
//       }
//     }
//
//
//     setTimeout(function() {
//       isDragging = false;
//     },100);
//   }
// }

class Group {

  constructor(color, firstMap, secondMap) {
    this.color = color;
    this.maps = [firstMap, secondMap];

    this.element = this.createGroupDOM(firstMap, secondMap);
  }

  createGroupDOM(a, b) {
    var offsetY = b.element.offset().top;
    var offsetX = b.element.offset().left;

    a.element.css({
      "border-color": this.color,
      "position": "absolute",
      "top": "0px",
      "left": "0px",
    });
    b.element.css({
      "border-color": this.color,
      "position": "absolute",
      "top": "10px",
      "left": "10px",
    });

    var newGroup = $('<div/>', {
        "class": 'workspace-group',
        "id": (groups.length).toString(),
        css: {
          "width": "110px",
          "height": "110px",
          "position": "absolute",
          "top": offsetY,
          "left": offsetX,
          //"background-color": this.color
        },
    }).append(a.element);
    newGroup.append(b.element);

    $("#workspace").append(newGroup);

    return newGroup;
  }

  addMap(map) {

    map.element.css({
      "border-color": this.color,
      "position": "absolute",
      "top": (this.maps.length*10 + "px"),
      "left": (this.maps.length*10 + "px")
    });

    this.element.append(map.element);
    this.element.css({
      "width": ((100 + this.maps.length*10) + "px"),
      "height": ((100 + this.maps.length*10) + "px"),
    })

    this.maps.push(map);
  }

  removeMap() {

  }

  stackGroup() {
    // let offset = 10;
    // let yDifference = otherItems[0].offsetHeight - copiedElement.outerHeight();
    // let yPosition = otherItems[0].offsetTop - yDifference/2 + offset;
    // let xDifference = otherItems[0].offsetWidth - copiedElement.outerWidth();
    // let xPosition = otherItems[0].offsetLeft - xDifference/2 + offset;
    // copiedElement.css({"top": yPosition + "px", "left": xPosition + "px"});
  }

  shuffle() {

  }


  drag() {

  }

  expandAll() {

  }

}

// get JSON data about maps
fetch('data.json')
  .then(function(response) {
    console.log(response);
    return response.json();
  })
  .then(function(jsonData) {
    console.log(jsonData);

    mapData = jsonData.maps;

    for (var i = 0; i < 11; i++) {
      var map = new ListMap(jsonData.maps[i]);
      mapsList.push(map);
    }


  })
  .catch(function(error) {
    console.log('There has been a problem with your fetch operation: ', error.message);
  });
