class WorkspaceItem {
  constructor(obj, tempX, tempY, tempDragging, add) {
    this._id = obj._id;
    this.metadata = {
      type: obj.metadata.type,
      title: obj.metadata.title,
      description: obj.metadata.description
    }

    this.thumbnail = {
      type: obj.thumbnail.type,
      content: obj.thumbnail.content
    }

    if (obj.hasOwnProperty("contains")) {
      this.contains = obj.contains;
    }

    if (obj.hasOwnProperty("is")) {
      this.is = obj.is;
    }

    if (obj.hasOwnProperty("in")) {
      this.in = obj.in;
    }

    this.x = tempX;
    this.y = tempY;

    this.dragging = tempDragging;

    if (obj.metadata.type == "group") {
      this.groupDisplay = "stacked"// collapsed, stacked, expanded
    }


    this.grouped = false;
    //this.hoveredOver = null;
    this.linkedRight = false;
    this.linkedLeft = false;

    this.linkIndex = null;

    this.element = this.createDOM()

    if (add) {
      this.element.appendTo("#linespace");
      this.element.attr({
        //"transform": "translate(350,350)",
        "transform": "translate(" + this.x + "," + this.y + ")",
      });
      this.element.attr("class", "active");
    }

    if (tempDragging) {
      objFromIndex = true;
      this.dragElement();
    }

    //make sure it's clickable
    //this.element.on('mousedown', this.dragElement.bind(this));
    this.element.on('mousedown', function(e) {
      isMouseDragging = false;
      isMouseDown = true;
      startingPos = [e.pageX, e.pageY];
    }.bind(this))

    this.element.on('mousemove', function(e) {
      if (!(e.pageX == startingPos[0] && e.pageY == startingPos[1]) && isMouseDown) {
        isMouseDragging = true;
        if (!this.dragging) {
          this.dragElement();
        }
      }
    }.bind(this))

    this.element.on('mouseup', function(e) {
      isMouseDragging = false;
      isMouseDown = false;
      startingPos = [];

      if (isMouseDragging) {
        console.log("Finished dragging");
      } else {
        console.log("Clicked");

        if (keyPressed && whichKey==16 && this.metadata.type=="group") {
          console.log("lets do a group thing");

          if (this.groupDisplay == "stacked") {
            this.collapseGroup();
          } else if (this.groupDisplay == "collapsed") {
            this.stackGroup();
          }

        } else {


          if (!this.grouped) {
            if (objFromIndex) {
              objFromIndex = false;
            } else {
              this.element.toggleClass("active inactive");
              this.element.children('.background').css("opacity","1");
              this.showInfo();
              workspace.activeObj = this;
            }
          }
        }
      }

    }.bind(this))

    this.element.on('mouseenter', function() {
      if (!this.grouped && this.groupDisplay != "collapsed") {
        this.showNodes();
        if (this.element.hasClass("inactive")) {
          this.element.children('.background').css("opacity","1")
        }
      } else if (this.groupDisplay == "collapsed") {
        this.showNodes();
      }
    }.bind(this));

    this.element.on('mouseleave', function() {
      if (!this.grouped && this.groupDisplay != "collapsed") {
        this.hideNodes();
        if (this.element.hasClass("inactive")) {
          this.element.children('.background').css("opacity","0")
        }
      } else if (this.groupDisplay == "collapsed") {
        this.hideNodes();
      }
    }.bind(this))
  }

  createDOM() {
    var el;

    if (this.metadata.type == 'object') {
      el = this.createSingleItem(this);
      return el;
    }

    else if (this.metadata.type == "group") {
      var groupId = this._id
      el = $(SVG('g'));

      var backgroundRect = $(SVG('rect'))
      .attr({
        "class": "background",
        "x": -6,
        "y": -6,
        "width": tileSize + 10*(this.contains.length)+12,
        "height": tileSize + 10*(this.contains.length)+12,
      })

      var nodeRight = $(SVG('circle'))
      .attr('mydata:mapObj', this.metadata.title)
      .attr('class', 'grip')
      .attr('cx',-2.5)
      .attr('cy',tileSize/2)
      .attr('r', 6)
      .attr('fill', "#cccccc")
      .attr('opacity', 0);

      var nodeLeft = $(SVG('circle'))
      .attr('mydata:mapObj', this.metadata.title)
      .attr('class', 'grip')
      .attr('cx',tileSize + 2.5)
      .attr('cy',tileSize/2)
      .attr('r', 6)
      .attr('fill', "#cccccc")
      .attr('opacity', 0);

      backgroundRect.appendTo(el);
      nodeRight.appendTo(el);
      nodeLeft.appendTo(el);

      var innerElements = [];
      //var promiseArray = [];
      // query the database for each internal object
      for (var i = 0; i < this.contains.length; i++) {
        var promise = getItem(this.contains[i].id)
        .then(function(response_item) {
          //console.log(response_item);
          var offset;
          var positionInGroup;
          for (var k = 0; k < response_item.in.length; k++) {
            if (response_item.in[k].id == groupId) {
              offset = (response_item.in[k].indexIn) * 10;
              positionInGroup = response_item.in[k].indexIn;
            }
          }
          var innerObj = new WorkspaceItem(response_item, 0, 0, false, false);
          innerObj.grouped = true;
          innerObj.positionInGroup = positionInGroup;

          innerObj.element.attr({
            "transform": "translate("+ offset +"," + offset +")",
            "class": "inactive",
            "data-position": positionInGroup
          });
          innerObj.element.appendTo(el);
        })
        //promiseArray.push(promise);
      }
      return el;

      // Promise.all(promiseArray).then(function() {
      //   console.log("all promises done");
      //
      // })
    }
  }

  createSingleItem(item) {
    var el = $(SVG('g'));

    var thumb;
    if (item.thumbnail.type == "image") {
      thumb = $(SVGimage("data/" + item.thumbnail.content)).attr({
        "width": tileSize,
        "height": tileSize,
        "preserveAspectRatio": "xMidYMid slice"
      })
    } else {
      thumb = $(SVG('text'))
      .attr({
        "x": 0,
        "y": 14,
        "fill": "#fff",
        "font-family": "Work Sans",
        "font-size": "14px"
      })
      .text(item.thumbnail.content)
    }

    var background = $(SVG('rect'))
    .attr({
      "class": "background",
      "x": -6,
      "y": -6,
      "width": tileSize+12,
      "height": tileSize+12,
    })

    var nodeRight = $(SVG('circle'))
    .attr('mydata:mapObj', this.metadata.title)
    .attr('class', 'grip')
    .attr('cx',-7)
    .attr('cy',tileSize/2)
    .attr('r', 5)
    // .attr("stroke", "#000")
    // .attr("stroke-width", 1)
    .attr('fill', "#ccc")
    .attr('opacity', 0);

    var nodeLeft = $(SVG('circle'))
    .attr('mydata:mapObj', this.metadata.title)
    .attr('class', 'grip')
    .attr('cx',tileSize + 7)
    .attr('cy',tileSize/2)
    .attr('r', 5)
    // .attr("stroke", "#000")
    // .attr("stroke-width", 1)
    .attr('fill', "#ccc")
    .attr('opacity', 0);

    nodeRight.appendTo(el);
    nodeLeft.appendTo(el);
    background.appendTo(el);
    thumb.appendTo(el);

    return el
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
    console.log("dragging");
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

        let transform = parseTransform(elem);
        let xChange = parseInt(transform.translate[0]) - currentX;
        let yChange = parseInt(transform.translate[1]) - currentY;
        $(elem).attr("transform", "translate(" + xChange + "," + yChange +")");

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

        // this.moveNodeBy($(this.leftNode), e.movementX, e.movementY);
        // this.moveNodeBy($(this.rightNode), e.movementX, e.movementY);
        //
        // if (this.linkedRight) {
        //   workspace.links[this.linkIndex].moveStartBy(e.movementX, e.movementY);
        // }
        //
        // if (this.linkedLeft) {
        //   workspace.links[this.linkIndex].moveEndBy(e.movementX, e.movementY);
        // }
        //
        // let itemsBelow = this.checkBelow(e.clientX, e.clientY);
        //
        // if (itemsBelow.match == "group") {
        //   var index = parseInt(itemsBelow.elems[0].id);
        //   workspace.groups[index].showBackground();
        //   this.hoveredOver = workspace.groups[index];
        // } else if (this.hoveredOver!= null && itemsBelow == "none") {
        //   this.hoveredOver.removeBackground();
        //   this.hoveredOver = null;
        //}
      }

      function stopDraggingElement(e) {
        e = e || window.event;
        this.dragging = false;

        // stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;

        // snap to grid
        let elem = document.getElementById("dragging");

        let transform = parseTransform(elem);
        let xChange = roundToGrid(parseInt(transform.translate[0]) - currentX - 10);
        let yChange = roundToGrid(parseInt(transform.translate[1]) - currentY);

        $(elem).attr("transform", "translate(" + xChange + "," + yChange +")");

        this.x = xChange;
        this.y = yChange;

        $('#dragging').addClass('inactive');
        $('#dragging').removeClass('active');

        $('#dragging').attr("id", null);

        // if (this.linkedRight) {
        //   workspace.links[this.linkIndex].moveStartTo(leftRound + tileSize + 5, topRound + tileSize/2);
        // }
        //
        // if (this.linkedLeft) {
        //   workspace.links[this.linkIndex].moveEndTo(leftRound - 3, topRound + tileSize/2);
        // }
        //
        //
        // let itemsBelow = this.checkBelow(e.clientX, e.clientY);
        // if (itemsBelow.match == "map") {
        //
        //   var matchingMap;
        //
        //   for (var i = 0; i < itemsBelow.elems.length; i++) {
        //     let id = (itemsBelow.elems[i].dataset.index).toString();
        //
        //     if (id != this.metadata.index) {
        //       matchingMap = workspace.maps.filter(function(item) {
        //         return (item.metadata.index == id? true : false);
        //       });
        //     }
        //   }
        //
        //   if (matchingMap != undefined) {
        //     console.log("create a new group");
        //     var x = matchingMap[0].element.offset().left;
        //     var y = matchingMap[0].element.offset().top;
        //     let group = new Group(bgColors[workspace.groups.length], this, matchingMap[0], x, y);
        //     this.grouped = true;
        //     matchingMap[0].grouped = true;
        //     workspace.groups.push(group);
        //
        //     this.removeFromArray();
        //     matchingMap[0].removeFromArray();
        //   }
        // } else if (itemsBelow.match == "group" && !this.grouped) {
        //   console.log("add to existing group!");
        //
        //   var index = parseInt(itemsBelow.elems[0].id);
        //   workspace.groups[index].addMap(this);
        //   this.grouped = true;
        //   this.removeFromArray();
        // }


      }
    }
  }

  stackGroup() {
    this.groupDisplay = "stacked";
    this.element.addClass("stacked");
    this.element.removeClass("collapsed");

    var internals = this.element.find('g');

    for (var i = 0; i < internals.length; i++) {
      var offset = i * 10;
      $(internals[i]).attr({
        "transform": "translate("+offset+","+offset+")"
      })
    }

    this.element.children('.background')
    .attr({
      "x": -6,
      "y": -6,
      "width": tileSize + 10*(this.contains.length)+12,
      "height": tileSize + 10*(this.contains.length)+12,
    })
    this.element.children('.drop').remove();
  }

  collapseGroup() {
    this.groupDisplay = "collapsed";
    this.element.addClass("collapsed");
    this.element.removeClass("stacked");
    var internals = this.element.find('g');

    for (var i = 0; i < internals.length; i++) {
      $(internals[i]).attr({
        "transform": "translate(0,0)"
      })
    }
    var background = this.element.children('.background')
    $(background).attr({
      "x": -6,
      "y": -6,
      "width": tileSize+12,
      "height": tileSize+12,
    })

    var drop = $(SVG('rect'))
    .attr({
      "class": "drop",
      "x": 0,
      "y": 0,
      "width": tileSize+12,
      "height": tileSize+12,
    })
    this.element.prepend(drop);
  }


  showNodes() {
    if (!this.grouped || (this.expanded && this.grouped)) {
      this.element.children(".grip").attr("opacity",1);
    }
  }

  hideNodes() {
    this.element.children(".grip").attr("opacity",0);
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

    if ($("#info").length >0) {
      $("#info").remove();
    }

    var div = document.createElement('div');
    div.id = "info";

    var appendString = "";

    var meta = "<div class='metadata'><p class='desc'>" + this.metadata.description + "</p></div>";

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

    div.innerHTML = appendString;
    var target = document.querySelector('#container');
    target.parentNode.insertBefore( div, target );

  }
}
