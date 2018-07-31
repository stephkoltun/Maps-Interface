class WorkspaceMap {
  constructor(obj, tempX, tempY, drag) {
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

    this.x = tempX;
    this.y = tempY;

    this.dragging = drag;
    this.grouped = false;
    this.hoveredOver = null;
    this.linkedRight = false;
    this.linkedLeft = false;

    this.linkIndex = null;

    // add it to the DOM
    this.element = this.createDOM();
    this.element.appendTo('#workspace');

    if (drag) {
      this.dragElement();
    } else {
      this.addNodes();
    }

    // make sure it's clickable
    this.element.on('mousedown', this.dragElement.bind(this));
    this.element.on('click', this.showInfo.bind(this));
    this.element.on('mouseenter', this.showNodes.bind(this));
    this.element.on('mouseleave', this.hideNodes.bind(this));
  }

  createDOM() {

    return $('<div/>', {
      "css": {
        "left": this.x + "px",
        "top": this.y + "px",
        "background-image": 'url("img/' + this.metadata.thumb + '")',
      },
      "class": 'workspace-item',
      "data-title": this.metadata.title,
      "data-index": this.metadata.index,
      "data-category": this.metadata.category,
    });
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
    } else if (mapsBelow.length > 0) {
      var below = {
        match: "map",
        elems: mapsBelow
      }
      return below;
    } else {
      return "none"
    }
  }

  dragElement() {
    if (!this.grouped) {
      this.element.attr("id","dragging");
      this.element.addClass("active");
      var currentX = 0, currentY = 0, previousX = 0, previousY = 0;
      var e = window.event;
      // get the mouse cursor position at startup:
      previousX = e.clientX;
      previousY = e.clientY;

      document.onmousemove = elementDrag.bind(this); // call a function whenever the cursor moves:
      document.onmouseup = stopDraggingElement.bind(this); // stop the dragging

      function elementDrag(e) {
        this.dragging = true;
        e = e || window.event;
        // calculate the new cursor position:
        currentX = previousX - e.clientX;
        currentY = previousY - e.clientY;
        previousX = e.clientX;
        previousY = e.clientY;
        // set the element's new position:
        let elem = document.getElementById("dragging");
        let xChange = elem.offsetLeft - currentX;
        let yChange = elem.offsetTop - currentY;
        elem.style.left = xChange + "px";
        elem.style.top = yChange + "px";


        this.hideNodes();
        // if we want to show them while moving - like when connected
        // $(this.leftNode).attr({
        //   "cx": parseInt($(this.leftNode).attr("cx")) + e.movementX,
        //   "cy": parseInt($(this.leftNode).attr("cy")) + e.movementY
        // });
        //
        // $(this.rightNode).attr({
        //   "cx": parseInt($(this.rightNode).attr("cx")) + e.movementX,
        //   "cy": parseInt($(this.rightNode).attr("cy")) + e.movementY
        // });

        this.moveNodeBy($(this.leftNode), e.movementX, e.movementY);
        this.moveNodeBy($(this.rightNode), e.movementX, e.movementY);

        if (this.linkedRight) {
          workspace.links[this.linkIndex].moveStartBy(e.movementX, e.movementY);
        }

        if (this.linkedLeft) {
          workspace.links[this.linkIndex].moveEndBy(e.movementX, e.movementY);
        }

        let itemsBelow = this.checkBelow(e.clientX, e.clientY);

        if (itemsBelow.match == "group") {
          var index = parseInt(itemsBelow.elems[0].id);
          workspace.groups[index].showBackground();
          this.hoveredOver = workspace.groups[index];
        } else if (this.hoveredOver!= null && itemsBelow == "none") {
          this.hoveredOver.removeBackground();
          this.hoveredOver = null;
        }
      }

      function stopDraggingElement(e) {
        e = e || window.event;

        // stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;

        // snap to grid
        let elem = document.getElementById("dragging");
        let topRound = roundToGrid(elem.offsetTop - currentY);
        let leftRound = roundToGrid(elem.offsetLeft - currentX);
        elem.style.top = (topRound - 2) + "px";
        elem.style.left = (leftRound - 2) + "px";

        this.x = elem.style.left;
        this.y = elem.style.top;

        $('#dragging').removeClass('active');
        $('#dragging').attr("id", null);

        if (this.leftNode == null) {
          this.addNodes();
          this.showNodes();
        } else {
          this.showNodes();
          this.moveNodeTo($(this.leftNode), leftRound - 3, topRound + tileSize/2);
          this.moveNodeTo($(this.rightNode), leftRound + tileSize + 5, topRound + tileSize/2);

          if (this.linkedRight) {
            workspace.links[this.linkIndex].moveStartTo(leftRound + tileSize + 5, topRound + tileSize/2);
          }

          if (this.linkedLeft) {
            workspace.links[this.linkIndex].moveEndTo(leftRound - 3, topRound + tileSize/2);
          }

        }


        let itemsBelow = this.checkBelow(e.clientX, e.clientY);
        if (itemsBelow.match == "map") {

          var matchingMap;

          for (var i = 0; i < itemsBelow.elems.length; i++) {
            let id = (itemsBelow.elems[i].dataset.index).toString();

            if (id != this.metadata.index) {
              matchingMap = workspace.maps.filter(function(item) {
                return (item.metadata.index == id? true : false);
              });
            }
          }

          if (matchingMap != undefined) {
            console.log("create a new group");
            var x = matchingMap[0].element.offset().left;
            var y = matchingMap[0].element.offset().top;
            let group = new Group(bgColors[workspace.groups.length], this, matchingMap[0], x, y);
            this.grouped = true;
            matchingMap[0].grouped = true;
            workspace.groups.push(group);

            this.removeFromArray();
            matchingMap[0].removeFromArray();
          }
        } else if (itemsBelow.match == "group" && !this.grouped) {
          console.log("add to existing group!");

          var index = parseInt(itemsBelow.elems[0].id);
          workspace.groups[index].addMap(this);
          this.grouped = true;
          this.removeFromArray();
        }

        setTimeout(function() {
          this.dragging = false;
        },100);
      }
    }
  }

  removeFromArray() {
    var arrayIndex;
    for (var i = 0; i < workspace.maps.length; i++) {
      if (workspace.maps[i].metadata.index == this.metadata.index) {
        arrayIndex = i;
      }
    };
    workspace.maps.splice(arrayIndex, 1);
  }

  addNodes() {
    this.rightNode = this.createNode('right');
    this.leftNode = this.createNode('left');
    this.rightNode.appendTo("#linespace");
    this.leftNode.appendTo("#linespace");

    this.hideNodes();

    this.rightNode.on('mousedown', this.addLink.bind(this));
  }

  createNode(side) {
    var x, y;

    typeof this.x === "number" ? x = this.x : x = parseInt(this.x.replace("px"));

    typeof this.y === "number" ? y = this.y : y = parseInt(this.y.replace("px"));

    if (side == "right") {
      x += (tileSize+4);
    }
    y += (tileSize/2 + 2);

    return $(SVG('circle'))
      .attr('mydata:mapObj', this.metadata.title)
      .attr("class", "grip")
      .attr('cx',x)
      .attr('cy',y)
      .attr('r', 6)
      .attr('fill', "#cccccc");
  }

  hideNodes() {
    if (!this.grouped || (this.expanded && this.grouped)) {
      if (!this.linkedRight && !this.linkedLeft) {

        let xBelow = window.event.clientX || 0;
        let yBelow = window.event.clientY || 0;

        let elementsBelow = document.elementsFromPoint(xBelow, yBelow);
        let circleBelow = elementsBelow.filter(function(item) {
          return (item.className.baseVal == "grip" ? true : false);
        });

        if (circleBelow.length == 0) {
          $(this.leftNode).attr("opacity",0);
          $(this.rightNode).attr("opacity",0);
        }
      }
    }
  }

  showNodes() {
    if (!this.grouped || (this.expanded && this.grouped)) {
      $(this.leftNode).attr("opacity",1);
      $(this.rightNode).attr("opacity",1);
    }
  }

  moveNodeBy(nodeTemp, moveX, moveY) {
    let prevX = nodeTemp.attr("cx");
    let newX = parseInt(prevX) + parseInt(moveX);
    let prevY = nodeTemp.attr("cy");
    let newY = parseInt(prevY) + parseInt(moveY);
    nodeTemp.attr("cx", newX);
    nodeTemp.attr("cy", newY);
  }

  moveNodeTo(nodeTemp, newX, newY) {
    nodeTemp.attr({
      "cx": newX,
      "cy": newY
    });
  }

  addLink() {
    console.log("node triggered");
    var e = window.event;
    var startX = $(this.rightNode).attr("cx");
    var startY = $(this.rightNode).attr("cy");

    this.rightNode.attr("fill","#aa11ee");

    var linkElem = $(SVG('line'))
      .attr("id", "newLink")
      .attr("class", "link")
      .attr({
        'x1': startX,
        'y1': startY,
        'x2': startX,
        'y2': startY
      })
      .css({
        "stroke": "#aa11ee",
        "stroke-width": "2px"
      });

    var newLink = new Link(this, "#aa11ee", linkElem);
    newLink.element.appendTo("#linespace");

    document.onmousemove = moveLinkEnd.bind(this); // call a function whenever the cursor moves:
    document.onmouseup = checkLinkEnd.bind(this); // stop the dragging


    function moveLinkEnd(e) {
      e = e || window.event;
      newLink.element.attr("x2", e.clientX);
      newLink.element.attr("y2", e.clientY);
    }

    function checkLinkEnd(e) {
      document.onmouseup = null;
      document.onmousemove = null;

      let elementsBelow = document.elementsFromPoint(e.clientX, e.clientY);

      let circleBelow = elementsBelow.filter(function(item) {
        return (item.className.baseVal == "grip" ? true : false);
      });

      if (circleBelow.length != 0) {

        let endX = $(circleBelow[0]).attr("cx");
        let endY = $(circleBelow[0]).attr("cy");
        $(circleBelow[0]).attr("fill", "#aa11ee");

        //find the matching map object
        var matchTitle = $(circleBelow[0]).attr("mydata:mapObj");
        var matchingMap = workspace.maps.filter(function(item) {
          return (item.metadata.title == matchTitle ? true : false);
        });
        // update the now-linked objects
        this.linkedRight = true;
        matchingMap[0].linkedLeft = true;
        matchingMap[0].showNodes();

        // let newID = "link" + this.metadata.index + "-" + matchingMap[0].metadata.index;
        newLink.element.attr("x2", endX);
        newLink.element.attr("y2", endY);
        newLink.element.attr("id", null);

        newLink.addEnd(matchingMap[0]);
        this.linkIndex = workspace.links.length;
        matchingMap[0].linkIndex = workspace.links.length;
        workspace.links.push(newLink);

      } else {
        if (!this.linkedRight) {
          this.rightNode.attr("fill", "#cccccc");
        }
        if (!this.linkedRight && !this.linkedLeft) {
          this.hideNodes();
        }

        newLink.element.remove();
      }
    }
  }

  showInfo() {
    if ($("#info-panel").length >0) {
      $("#info-panel").remove();
    }

    if ($(".activeInfo").length > 0) {
      let prevLeft = $(".activeInfo").offset().left;
      $(".activeInfo").offset({left: prevLeft+2 });
      $(".activeInfo").removeClass("activeInfo");
    }

    this.element.addClass("activeInfo");
    let curPosition = this.element.offset().left;
    this.element.offset({left: curPosition-2 });

    var appendString = "";


    var meta = "<div class='metadata'><p class='cat'>" + this.metadata.category + "</p><p class='desc'>" + this.metadata.description + "</p></div>";

    if (this.metadata.title != null) {
      var title = "<h1>" + this.metadata.title + "</h1>";
      appendString += title
    }

    if (this.metadata.post != null) {
      var post = "<div class='post'>" + this.metadata.post + "</div>";
      appendString += post;
    }

    if (this.metadata.images != null) {
      var images = "<div class='images'><div id='image-inset'>";
      for (var i = 0; i < this.metadata.images.length; i++) {
        images += "<div class='image-item'><img src='img/" + this.metadata.images[i] + "'/></div>";
      }
      images += "</div></div>";

      appendString += images;
    }


    $('<div/>', {
      "id": 'info-panel',
    }).append(appendString).appendTo('.workspace-wrapper');

    $('#image-inset').imagesLoaded( function() {
      console.log("images loaded");
      $('#image-inset').isotope({
        // options...
        itemSelector: '.image-item',
        percentPosition: true,
        cellsByRow: {
          columnWidth:'.image-sizer',
          rowHeight: '.image-sizer'
        }
      });

    });
  }
}
