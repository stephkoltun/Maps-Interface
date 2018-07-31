class ListMap {

  constructor(obj) {
    this.metadata = {
      index: obj._id,
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
    let img = $("<img/>", {
      "src": "img/" + this.metadata.thumb,
      "draggable": "false",
    })

    let title = $("<h1/>").text(this.metadata.title);

    return $('<div/>', {
        "class": 'list-item',
        "data-title": this.metadata.title,
        "data-index": this.metadata.index,
        "data-category": this.metadata.category,
    }).append(img).append(title);
  }

  mouseDown() {
    let x = window.event.clientX-tileSize/2;
    let y = window.event.clientY-tileSize/2;

    let workspaceObj = new WorkspaceMap(this.metadata, x, y, true);
    workspace.maps.push(workspaceObj);
  }
}
