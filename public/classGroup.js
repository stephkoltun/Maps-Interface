class Group {

  constructor(color, firstMap, secondMap, tempX, tempY) {
    this.color = color;
    this.maps = [firstMap, secondMap];
    this.expanded = false;
    this.dragging = false;

    this.linkedWithin = false;
    this.linked = false;
    this.linkedRight = false;
    this.linkedLeft = false;
    this.linkIndex = null;

    this.x = tempX;
    this.y = tempY;

    firstMap.hideNodes();
    secondMap.hideNodes();

    this.element = this.createGroupDOM(firstMap, secondMap);

    this.addNodes();

    this.element.on('dblclick', this.toggleView.bind(this));
    this.element.on('mousedown', this.dragGroup.bind(this));

    this.element.on('mouseenter', this.showBackground.bind(this));
    this.element.on('mouseleave', this.removeBackground.bind(this));
  }

  createGroupDOM(a, b) {
    a.element.css({
      "border-color": this.color,
      "position": "absolute",
      "top": "10px",
      "left": "10px",
    });
    b.element.css({
      "border-color": this.color,
      "position": "absolute",
      "top": "20px",
      "left": "20px",
    });

    var newGroup = $('<div/>', {
        "class": 'workspace-group',
        "id": (workspace.groups.length).toString(),
        css: {
          "width": "134px",
          "height": "134px",
          "position": "absolute",
          "left": this.x,
          "top": this.y,
          "border": "2px solid " + this.color
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
      "top": (this.maps.length*10+10 + "px"),
      "left": (this.maps.length*10+10 + "px")
    });

    this.element.append(map.element);
    this.element.css({
      "width": ((120 + this.maps.length*10) + "px"),
      "height": ((120 + this.maps.length*10) + "px"),
    })

    this.maps.push(map);

    this.moveNodeBy($(this.rightNode), 5, 0)
  }

  removeMap() {

  }

  addNodes() {
    this.rightNode = this.createNode('right');
    this.leftNode = this.createNode('left');
    this.rightNode.appendTo("#linespace");
    this.leftNode.appendTo("#linespace");

    this.hideNodes();

    this.rightNode.hover(this.showNodes.bind(this), this.hideNodes.bind(this));
    this.rightNode.on('mousedown', this.addLink.bind(this));
  }

  createNode(side) {
    var x, y;
    var dimension = 10*(this.maps.length+1) + 104;

    typeof this.x === "number" ? x = this.x : x = parseInt(this.x.replace("px"));
    typeof this.y === "number" ? y = this.y : y = parseInt(this.y.replace("px"));

    if (side == "right") {
      x += dimension + 1;
    } else {
      x -= 1;
    }
    y += dimension/2 - 1;

    return $(SVG('circle'))
      .attr("class", "grip")
      .attr('cx',x)
      .attr('cy',y)
      .attr('r', 6)
      .attr('fill', "#cccccc");
  }

  moveNodeBy(nodeTemp, moveX, moveY) {
    let prevX = nodeTemp.attr("cx");
    let newX = parseInt(prevX) + parseInt(moveX);
    let prevY = nodeTemp.attr("cy");
    let newY = parseInt(prevY) + parseInt(moveY);
    nodeTemp.attr("cx", newX);
    nodeTemp.attr("cy", newY);
  }

  showNodes() {
    $(this.leftNode).attr("opacity",1);
    $(this.rightNode).attr("opacity",1);
  }

  hideNodes() {
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
  };

  addLink() {
    console.log("node triggered");
    var e = window.event;
    var startX = $(this.rightNode).attr("cx");
    var startY = $(this.rightNode).attr("cy");

    this.rightNode.attr("fill","#aa11ee");
    this.linkedRight = true;

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
        if (this.linkedRight) {
          this.linkedRight = false;
          this.rightNode.attr("fill", "#cccccc");
        }
        if (this.linkedRight && !this.linkedLeft) {
          this.hideNodes();
        }

        newLink.element.remove();
      }
    }
  }

  dragGroup() {
    if (!this.expanded) {
      this.element.attr("id","dragging");

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
        elem.style.top = (elem.offsetTop - currentY) + "px";
        elem.style.left = (elem.offsetLeft - currentX) + "px";
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

        $('#dragging').attr("id", null);

        setTimeout(function() {
          this.dragging = false;
        },100);
      }
    }
  }

  toggleView() {
    if (this.expanded) {
      this.stackAll();
    } else {
      this.expandAll();
    }
  }

  stackAll() {
    console.log("stack");
    this.expanded = false;

    for (var i = 0; i < this.maps.length; i++) {
      this.maps[i].expanded = false;
      var mapElement = this.maps[i].element;
      mapElement.css({
        "top": 10*i + 10 + "px",
        "left": 10*i + 10 + "px",
        "z-index": i,
      })
    }

    this.element.css({
      "width": (((this.maps.length+1)*10 + 104) + "px"),
      "height": (((this.maps.length+1)*10 + 104) + "px"),
      "background-color": this.color
    })
  }

  expandAll() {
    this.expanded = true;

    // for each individual map
    for (var i = 0; i < this.maps.length; i++) {
      var thisMap = this.maps[i];
      thisMap.expanded = true;
      var mapElement = thisMap.element;
      mapElement.css({
        "top": "10px",
        "left": 15*(i+1) + 104*i + "px"
      })

      var x = thisMap.element.offset().left;
      var y = thisMap.element.offset().top;

      console.log(x, y)
      thisMap.moveNodeTo($(thisMap.leftNode), x + 2, y + tileSize/2 + 2);
      thisMap.moveNodeTo($(thisMap.rightNode), x + tileSize + 6, y + tileSize/2 + 2);
    }


    this.element.css({
      // this is only temporary:
      "width": (((this.maps.length-1)*104 + (this.maps.length+1)*15) + "px"),
      //"width": ((this.maps.length*104 + (this.maps.length+1)*15) + "px"),
      "height": ("124px"),
      //"background-color": this.color
      //"border": "2px solid " + this.color,
      "background-color": "transparent"
    })

    // for the overall group
    var tempX = parseInt((this.maps.length-1)*104 + (this.maps.length)*10);
    var tempY = 0;
    this.moveNodeBy($(this.rightNode), tempX, tempY);
    if (this.linkedRight) {
      workspace.links[this.linkIndex].moveStartBy(tempX, tempY);
    }
  }

  showBackground() {
    this.showNodes();
    if (!this.expanded) {
      this.element.css({
        "background-color": this.color
      })
    }
  }

  removeBackground() {
    this.hideNodes();
    if (!this.expanded) {
      this.element.css({
        "background-color": "transparent"
      })
    }
  }
}
