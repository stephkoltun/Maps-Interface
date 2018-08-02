var listItems = [];

class ListItem {

  constructor(obj) {
    this._id = obj._id;
    this.metadata = {
      type: obj.metadata.type,
      title: obj.metadata.title,
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

    // add it to the DOM
    this.element = this.createDom();
    this.element.appendTo('#list');

    // make sure it's clickable
    this.element.on('mousedown', this.mouseDown.bind(this)); // bind the whole object, rather than just the DOM element
  }

  createDom() {
    let el = $('<div/>', {
        "class": 'list-item',
        "data-index": this._id,
    })

    let title = $("<h1/>").text(this.metadata.title);

    if (this.thumbnail.type == "image") {

      let img = $("<img/>", {
        "src": "data/" + this.thumbnail.content,
        "draggable": "false",
      })

      if (this.metadata.type == "group") {
        img.css({
          "filter": "grayscale(100%) opacity(0.2)",
        });
      }

      el.append(img);
    }
    else if (this.thumbnail.type == "text") {
      let text = $("<p>" + this.thumbnail.content + "</p>")

      el.append(text);
    }

    if (this.metadata.type == "group") {
      el.css("box-shadow", "3px 3px #000");
    }


    el.append(title)
    return el;
  }

  mouseDown() {
    let x = window.event.clientX-tileSize/2;
    let y = window.event.clientY-tileSize/2;

    let workspaceObj = new WorkspaceItem(this, x, y, true, true);
    workspace.contains.push(workspaceObj);
  }
}
