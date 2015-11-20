L.Control.Dialog = L.Control.extend({
  options: {
    size: [ 200, 300 ],
    minSize: [ 100, 100 ],
    maxSize: [ 350, 350 ],
    anchor: [ 250, 250 ],
    position: 'topleft'
  },

  initialize: function (options){
    L.setOptions(this, options);

    this._attributions = {};
  },

  onAdd: function (map){

    this._initLayout();
    this._map = map;

    this.update();

    return this._container;
  },

  open: function(){
    if(!this._map){
      return;
    }
    this._container.style.visibility = '';
  },

  close: function(){
    this._container.style.visibility = 'hidden';
  },

  destroy: function(){
    if(!this._map){ return this; }

    this.removeFrom(this._map);

    if (this.onRemove) {
			this.onRemove(this._map);
		}

    return this;
  },

  setContent: function(content){
    this._content = content;
    this.update();
    return this;
  },

  getContent: function(){
    return this._content;
  },

  getElement: function(){
    return this._container;
  },

  update: function(){
    if (!this._map) { return; }

    this._container.style.visibility = 'hidden';

    this._updateContent();
    this._updateLayout();

    this._container.style.visibility = '';

  },

  _initLayout: function(){
    var className = 'leaflet-control-dialog',
      container = this._container = L.DomUtil.create('div', className);

    container.style.width = this.options.size[0] + 'px';
    container.style.height = this.options.size[1] + 'px';

    container.style.left = this.options.anchor[0] + 'px';
    container.style.top = this.options.anchor[1] + 'px';

    var stop = L.DomEvent.stopPropagation;
    L.DomEvent
        .on(container, 'click', stop)
        .on(container, 'mousedown', stop)
        .on(container, 'touchstart', stop)
        .on(container, 'dblclick', stop)
        .on(container, 'mousewheel', stop)
        .on(container, 'contextmenu', stop)
        .on(container, 'MozMousePixelScroll', stop);

    var innerContainer = this._innerContainer = L.DomUtil.create('div', className + '-inner');

    var grabberNode = this._grabberNode = L.DomUtil.create('div', className + '-grabber');
    var grabberIcon = L.DomUtil.create('i', 'fa fa-arrows');
    grabberNode.appendChild(grabberIcon);

    L.DomEvent.on(grabberNode, 'mousedown', this._handleMoveStart, this);

    var closeNode = this._closeNode = L.DomUtil.create('div', className + '-close');
    var closeIcon = L.DomUtil.create('i', 'fa fa-times');
    closeNode.appendChild(closeIcon);
    L.DomEvent.on(closeNode, 'click', this._handleClose, this);

    var resizerNode = this._resizerNode = L.DomUtil.create('div', className + '-resizer');
    var resizeIcon = L.DomUtil.create('i', 'fa fa-arrows-h fa-rotate-45');
    resizerNode.appendChild(resizeIcon);

    L.DomEvent.on(resizerNode, 'mousedown', this._handleResizeStart, this);

    var contentNode = this._contentNode = L.DomUtil.create('div', className + "-contents");

    container.appendChild(innerContainer);

    innerContainer.appendChild(grabberNode);
    innerContainer.appendChild(closeNode);
    innerContainer.appendChild(contentNode);
    innerContainer.appendChild(resizerNode);

    this._oldMousePos = { x: 0, y: 0 };

  },

  _handleClose: function(){
    this.close();
  },

  _handleResizeStart: function(e){
    this._oldMousePos.x = e.clientX;
    this._oldMousePos.y = e.clientY;

    L.DomEvent.on(this._map, 'mousemove', this._handleMouseMove, this);
    L.DomEvent.on(this._map, 'mouseup', this._handleMouseUp, this);

    this._resizing = true;
  },

  _handleMoveStart: function(e){
    this._oldMousePos.x = e.clientX;
    this._oldMousePos.y = e.clientY;

    L.DomEvent.on(this._map, 'mousemove', this._handleMouseMove, this);
    L.DomEvent.on(this._map, 'mouseup', this._handleMouseUp, this);

    this._moving = true;
  },

  _handleMouseMove: function(e){
    var diffX = e.originalEvent.clientX - this._oldMousePos.x,
      diffY = e.originalEvent.clientY - this._oldMousePos.y;

      // this helps prevent accidental highlighting on drag:
    if(e.originalEvent.stopPropagation){ e.originalEvent.stopPropagation(); }
    if(e.originalEvent.preventDefault){ e.originalEvent.preventDefault(); }

    if(this._resizing){
      this._resize(diffX, diffY);
    }

    if(this._moving){
      this._move(diffX, diffY);
    }
  },

  _handleMouseUp: function(){
    L.DomEvent.off(this._map, 'mousemove', this._handleMouseMove, this);
    L.DomEvent.off(this._map, 'mouseup', this._handleMouseUp, this);

    this._resizing = false;
    this._moving = false;
  },

  _move: function(diffX, diffY){
    var newX = this.options.anchor[0] + diffX;
    var newY = this.options.anchor[1] + diffY;

    if( newX > window.clientWidth ||
      newX < 0 ||
      newY > window.clientHeight ||
      newY < 0 ){ return; }

    this.options.anchor[0] = newX;
    this.options.anchor[1] = newY;

    this._container.style.left = this.options.anchor[0] + 'px';
    this._container.style.top = this.options.anchor[1] + 'px';

    this._oldMousePos.x += diffX;
    this._oldMousePos.y += diffY;
  },

  _resize: function(diffX, diffY){
    var newX = this.options.size[0] + diffX;
    var newY = this.options.size[1] + diffY;

    if( newX <= this.options.maxSize[0] && newX >= this.options.minSize[0]){
      this.options.size[0] = newX;
      this._container.style.width = this.options.size[0] + 'px';
      this._oldMousePos.x += diffX;
    }

    if(newY <= this.options.maxSize[1] && newY >= this.options.minSize[1] ){
      this.options.size[1] = newY;
      this._container.style.height = this.options.size[1] + 'px';
      this._oldMousePos.y += diffY;
    }
  },

  _updateContent: function(){

    if(!this._content){ return; }

    var node = this._contentNode;
    var content = (typeof this._content === 'function') ? this._content(this) : this._content;

    if(typeof content === 'string'){
      node.innerHTML = content;
    }
    else{
      while(node.hasChildNodes()){
        node.removeChild(node.firstChild);
      }
      node.appendChild(content);
    }

  },

  _updateLayout: function(){

    this._container.style.width = this.options.size[0] + 'px';
    this._container.style.height = this.options.size[1] + 'px';

    this._container.style.left = this.options.anchor[0] + 'px';
    this._container.style.top = this.options.anchor[1] + 'px';

  }

});

L.control.dialog = function (options) {
  return new L.Control.Dialog(options);
};
