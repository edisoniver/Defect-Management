document.addEventListener('DOMContentLoaded', function () {
    const canvas = new fabric.Canvas('canvas');
    const imageLoader = document.getElementById('imageLoader');
    const addLabelButton = document.getElementById('addLabel');
    const addArrowButton = document.getElementById('addArrow');
    const colorPicker = document.getElementById('colorPicker');
    const exportButton = document.getElementById('export');

    imageLoader.addEventListener('change', function (e) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const imgObj = new Image();
            imgObj.src = event.target.result;
            imgObj.onload = function () {
              const img = new fabric.Image(imgObj);
              const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
              img.set({
                  left: 0,
                  top: 0,
                  scaleX: scale,
                  scaleY: scale,
                  selectable: false,
                  evented: false,
              });
              canvas.add(img);
              canvas.sendToBack(img);
              canvas.renderAll();
          }
        };
        reader.readAsDataURL(e.target.files[0]);
    }, false);

    addLabelButton.addEventListener('click', function () {
        const fontSize = document.getElementById('font-size').value;
        const text = new fabric.Textbox('Defect', {
            left: 10,
            top: 10,
            fontFamily: 'Times New Roman',
            fill: 'red',
            borderColor: 'red',
            cornerColor: 'green',
            cornerSize: 6,
            transparentCorners: false,
            fontSize: parseInt(fontSize, 10),
            hasControls: true,
        });

        canvas.add(text);
        canvas.setActiveObject(text);
    });

    addArrowButton.addEventListener('click', function () {
        const arrowWidth = document.getElementById('arrow-width').value;

        const arrow = new fabric.Line([50, 50, 200, 200], {
            left: 15,
            top: 15,
            stroke: 'black',
            strokeWidth: parseInt(arrowWidth, 10),
            selectable: true,
            hasBorders: false,
            hasControls: true,
            padding: 10,
            originX: 'center',
            originY: 'center',
            hasControls: true,
        });

        const arrowHead = new fabric.Triangle({
            left: arrow.x2 - 10,
            top: arrow.y2 - 10,
            width: 20,
            height: 20,
            fill: 'black',
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false
        });

        const group = new fabric.Group([arrow], {
            selectable: true,
            hasControls: true
        });

        canvas.add(group);
        canvas.setActiveObject(group);
    });

    fabric.BorderedText = fabric.util.createClass(fabric.IText, {
        type: 'borderedText',
        initialize: function (text, options) {
          this.callSuper('initialize', text, options);
          options = options || {};
          this.borderColor = options.borderColor || 'black';
          this.borderSize = options.borderSize || 2;
        },
        _renderText: function (ctx, textLines, left, top) {
          this.callSuper('_renderText', ctx, textLines, left, top);
          this._renderBorder(ctx);
        },
        _renderBorder: function (ctx) {
          const w = this.width + this.borderSize * 2;
          const h = this.height + this.borderSize * 2;
          const x = -this.width / 2 - this.borderSize;
          const y = -this.height / 2 - this.borderSize;
      
          ctx.save();
          ctx.strokeStyle = this.borderColor;
          ctx.lineWidth = this.borderSize;
          ctx.strokeRect(x, y, w, h);
          ctx.restore();
        },
      });
      
    const fontSizeInput = document.getElementById('font-size');

    fontSizeInput.addEventListener('input', function (e) {
        const activeObject = canvas.getActiveObject();
        if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'borderedText')) {
            activeObject.set({ fontSize: parseInt(e.target.value, 10) });
            canvas.renderAll();
        }
    });
      

    const addBorderedLabelButton = document.getElementById('addBorderedLabel');

    addBorderedLabelButton.addEventListener('click', function () {
        const fontSize = document.getElementById('font-size').value;
        const text = new fabric.BorderedText('Label', {
          left: 10,
          top: 10,
          fontFamily: 'Times New Roman',
          fill: '#333333',
          borderColor: 'black',
          borderSize: 2,
          cornerSize: 6,
          transparentCorners: false,
          fontSize: parseInt(fontSize, 10),
          hasControls: true,
        });
      
        canvas.add(text);
        canvas.setActiveObject(text);
      });
      




    const borderColorPicker = document.getElementById('borderColorPicker');

    borderColorPicker.addEventListener('input', function (e) {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'borderedText') {
          activeObject.set({ borderColor: e.target.value });
          canvas.renderAll();
        }
      });
      
      
      colorPicker.addEventListener('input', function (e) {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'textbox') {
          activeObject.set({ fill: e.target.value });
        } else if (activeObject && activeObject.type === 'borderedText') {
          activeObject.set({ fill: e.target.value });
        } else if (activeObject && activeObject.type === 'group') {
          activeObject.item(0).set({ stroke: e.target.value });
          activeObject.item(1).set({ fill: e.target.value });
        } else if (activeObject && activeObject.type === 'line') {
          activeObject.set({ stroke: e.target.value });
        } else if (activeObject && activeObject.type === 'triangle') {
          activeObject.set({ fill: e.target.value });
        }
        canvas.renderAll();
      });
      
    


    const copyButton = document.getElementById('copyButton');
    const pasteButton = document.getElementById('pasteButton');
    let copiedObject = null;

    copyButton.addEventListener('click', function () {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.clone(function (cloned) {
                copiedObject = cloned;
            });
        }
    });

    pasteButton.addEventListener('click', function () {
        if (copiedObject) {
            copiedObject.clone(function (clonedObj) {
                canvas.add(clonedObj);
                clonedObj.set({
                    left: clonedObj.left + 10,
                    top: clonedObj.top + 10,
                    evented: true,
                });
                canvas.setActiveObject(clonedObj);
                canvas.renderAll();
            });
        }
    });

    const deleteButton = document.getElementById('delete-button');

    deleteButton.addEventListener('click', () => {
        const activeObject = canvas.getActiveObject();

        if (activeObject) {
            canvas.remove(activeObject);
        }
    });


    exportButton.addEventListener('click', function () {
        const dataURL = canvas.toDataURL({ format: 'png' });
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'annotated_image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});
