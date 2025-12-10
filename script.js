const newProject = document.getElementById('new-project');
const projectContainer = document.getElementById('project-container');
const promptContainer = document.getElementById('prompt-container');
const projectTitle = document.getElementById('project-title');
const frame = document.getElementById('frame');
const elementspace = document.getElementById('elementspace');
const prompt = promptContainer.querySelector('input');
const send = promptContainer.querySelector('i');
const uploadImg = document.getElementById('upload-img');

const arrow = document.getElementById('arrow');
const textbox = document.getElementById('textbox');

const downloadButton = document.getElementById('download-button');
downloadButton.style.cursor = 'not-allowed';

let editing = false;
let activeTextBar;

arrow.addEventListener('click', () => {
    const proj = document.querySelector('.selected');
    if(proj){
        projectElements[proj.id].header = arrowBar(proj.id);
        attentionSelected(proj);
    }

    const picture = document.getElementById(`${proj.id}-canvas`);
    if (picture){
        picture.style.cursor = 'pointer';
    }

    const textBoxes = document.querySelectorAll('.text-box');

    for (const box of textBoxes){
        box.contentEditable = false;
        box.style.cursor = 'pointer';
    }
});

textbox.addEventListener('click', () => {
    const proj = document.querySelector('.selected');
    if(proj){
        projectElements[proj.id].header = textBar();
        attentionSelected(proj);
    }

    const picture = document.getElementById(`${proj.id}-canvas`);
    if (picture){
        picture.style.cursor = 'text';
    }

    const textBoxes = document.querySelectorAll('.text-box');

    for (const box of textBoxes){
        box.contentEditable = true;
        box.style.cursor = 'text';
    }
});

uploadImg.addEventListener('change', (e) =>{
    const file = e.target.files[0];
    const newImg = document.createElement('img');
    newImg.classList.add('upload-img');
    newImg.src = URL.createObjectURL(file);

    const proj = document.querySelector('.selected');
    const picture = document.getElementById(`${proj.id}-canvas`);

    if (picture) {
        picture.appendChild(newImg);
    }
    newImg.addEventListener('mousedown', (e) =>{
        e.preventDefault();
        if (picture){
            newImg.style.cursor = 'grab';
            const startX = e.clientX;
            const startY = e.clientY;
            const startLeft = parseInt(newImg.style.left) || 0;
            const startTop = parseInt(newImg.style.top) || 0;

            function onMouseMove(e) {
                console.log('s3');

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                newImg.style.left = (startLeft + deltaX) + 'px';
                newImg.style.top = (startTop + deltaY) + 'px';
            }
            

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                newImg.style.cursor = 'default';
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    });
});

let n = 1; let nm = `Project ${n}`;

let projectElements = {};

newProject.addEventListener("click", (e) => {
    e.preventDefault();
    projectContainer.appendChild(createProject(nm));
    n += 1;
    nm = `Project ${n}`;
    if (! send.classList.contains('clickable')){
        send.classList.add('clickable');
    }
});

function createProject(nm){
    const project = document.createElement('div');
    project.classList.add('project');
    project.id = nm;

    project.addEventListener('click', () =>{
        attentionSelected(project);
    });

    project.innerHTML = `<div class="name">${nm}</div><i class="material-symbols-outlined">delete</i>`;

    const header = arrowBar(nm);
    // const header = textBar();


    projectElements[nm] = {
        'header': header,
        'mainMaterial': null
    };

    attentionSelected(project);
    
    return project;
}

function attentionSelected(project){
    const selectedProjects = projectContainer.querySelectorAll('.selected');
    for (let selected of selectedProjects){
        selected.classList.remove('selected');
    }
    project.classList.add('selected');

    console.log(project.id);

    const header = projectElements[project.id].header;
    
    projectTitle.innerHTML = '';
    projectTitle.appendChild(header);

    frame.innerHTML = '';

    const mainMaterial = projectElements[project.id].mainMaterial;

    if (mainMaterial){
        frame.appendChild(mainMaterial);
    }
    else{
        const greetings = document.createElement("div");
        greetings.classList.add('greet');
        greetings.innerHTML = 'How can I help you?';
        frame.appendChild(greetings);
    }
}

function createOutput(img, cap, w, h, id){
    const mainMaterial = document.createElement('div');
    mainMaterial.classList.add('project-main');

    const picture = document.createElement('div');
    picture.id = `${id}-canvas`;

    picture.classList.add('picture');
    picture.style.width = `${w}px`;
    picture.style.height = `${h}px`;
    picture.appendChild(img);

    const caption = document.createElement('div');
    caption.classList.add('caption');
    caption.style.width = `${w}px`;
    caption.innerHTML = cap;

    mainMaterial.appendChild(caption);
    mainMaterial.appendChild(picture);

    picture.addEventListener('click', (e) =>{
        if (e.target instanceof HTMLImageElement){
            const textbar = projectTitle.querySelectorAll('.textbar')[0];
            if (textbar){
                const fontstyle = textbar.querySelectorAll('select')[0].value;
                const fontsize = textbar.querySelectorAll('.font-size')[0].value;
                const fontcolor = textbar.querySelectorAll('.font-color')[0].value;
                const rect = picture.getBoundingClientRect();

                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                picture.appendChild(createText(fontcolor, fontsize, fontstyle, x, y, picture));
            }
        }
    });

    return mainMaterial;
}

const buttons = elementspace.querySelectorAll('*');
buttons.forEach(b =>{
    b.addEventListener('click', () =>{
        for (b2 of buttons){
            if (b2.classList.contains('element-select')){
                b2.classList.remove('element-select');
            }
        }
        b.classList.add('element-select');
    })
});



send.addEventListener('click', async () => {
    if (prompt.value != '') {
        const text = prompt.value;
        prompt.value = '';
        let val;
        const buttons = document.querySelectorAll('.dimension-button');
        frame.innerHTML = ``;
        frame.appendChild(load());
        for (let b of buttons) {
            if (b.classList.contains('button-selected')) {
                val = b.id;
            }
        }
        
        try {
            const outputs = await fetchData(text, val);
            const w = outputs[1]; const h = outputs[2];
            const img = outputs[0];
            console.log(outputs);
            if (img) {
                const project = document.querySelectorAll('.selected')[0];
                const id = project.id;

                projectElements[id].mainMaterial = createOutput(img, 'Generating caption for your poster...', w, h, id);
                attentionSelected(project);
                try{
                    const caption = await fetchCaption(text);
                    if (caption){
                        projectElements[id].mainMaterial = createOutput(img, caption, w, h, id);
                        downloadButton.style.cursor = 'pointer';
                    }
                    const projTitle = document.getElementById('project-title');
                    const bar = projTitle.querySelectorAll('.textbar')[0];
                    if(bar){
                        const plastic = bar.querySelectorAll('.plastic')[0];
                        bar.removeChild(plastic);
                    }
                    editing = true;
                } catch (error) {
                    console.error('Error:', error);
                }

                attentionSelected(project);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
});

async function fetchCaption(prompt) {
  try {
    const response = await fetch(`/api/caption?prompt=${encodeURIComponent(prompt)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const caption = await response.text();
    console.log("Generated Caption:", caption);
    return caption;
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}

async function fetchData(prompt, dim) { 
  let width = 500; 
  let height = 500;
  
  if (dim === 'landscape') {
    width = 889;
  } else if (dim === 'portrait') {
    height = 889;
  }
  
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=flux`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = prompt;
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
    
    console.log('Image loaded!', img.src);
    return [img, width, height];
  } catch (error) {
    console.error('Error:', error);

    return [error, width, height];
  }
}

function load(){
    const loading = document.createElement('div');
    loading.classList.add('loading');
    const dot1 = document.createElement("div");
    const dot2 = document.createElement("div");
    const dot3 = document.createElement("div");
    dot1.classList.add('dot');
    dot2.classList.add('dot');
    dot3.classList.add('dot');

    loading.appendChild(dot1);
    loading.appendChild(dot2);
    loading.appendChild(dot3);

    return loading;
}

function textBar(){
    const textbar = document.createElement('div');
    textbar.classList.add('textbar');
    textbar.innerHTML = 'Text Settings';

    const fontstyleTab = document.createElement('div');
    fontstyleTab.classList.add('tab');

    const i1 = document.createElement('i');
    i1.classList.add('material-symbols-outlined');
    i1.innerHTML = 'slab_serif';

    const fontstyle = document.createElement('select');
    fontstyle.innerHTML = `
            <option value="Arial" selected class="font-option">Arial</option>
            <option value="Helvetica" class="font-option">Helvetica</option>
            <option value="Times New Roman" class="font-option">Times New Roman</option>
            <option value="Times" class="font-option">Times</option>
            <option value="Courier New" class="font-option">Courier New</option>
            <option value="Courier" class="font-option">Courier</option>
            <option value="Verdana" class="font-option">Verdana</option>
            <option value="Georgia" class="font-option">Georgia</option>
            <option value="Tahoma" class="font-option">Tahoma</option>
            <option value="Trebuchet MS" class="font-option">Trebuchet MS</option>
            <option value="Impact" class="font-option">Impact</option>
            <option value="Comic Sans MS" class="font-option">Comic Sans MS</option>
            <option value="Roboto" class="font-option">Roboto</option>
            <option value="Open Sans" class="font-option">Open Sans</option>
            <option value="Lato" class="font-option">Lato</option>
            <option value="Montserrat" class="font-option">Montserrat</option>
            <option value="Poppins" class="font-option">Poppins</option>
            <option value="Source Sans Pro" class="font-option">Source Sans Pro</option>
            <option value="Merriweather" class="font-option">Merriweather</option>
            <option value="Playfair Display" class="font-option">Playfair Display</option>
        `;

    fontstyleTab.appendChild(i1);
    fontstyleTab.appendChild(fontstyle);

    const fontsizeTab = document.createElement('div');
    fontsizeTab.classList.add('tab');

    const i2 = document.createElement('i');
    i2.classList.add('material-symbols-outlined');
    i2.innerHTML = 'format_size';

    const fontSize = document.createElement('input');
    fontSize.classList.add('font-size');
    fontSize.type = 'number';
    fontSize.value = 14;

    fontsizeTab.appendChild(i2);
    fontsizeTab.appendChild(fontSize);

    const fontcolorTab = document.createElement('div');
    fontcolorTab.classList.add('tab');

    const i3 = document.createElement('i');
    i3.classList.add('material-symbols-outlined');
    i3.innerHTML = 'format_color_fill';

    const fontcolor = document.createElement('input');
    fontcolor.classList.add('font-color');
    fontcolor.type = 'color';

    fontcolorTab.appendChild(i3);
    fontcolorTab.appendChild(fontcolor);

    textbar.appendChild(fontstyleTab);
    textbar.appendChild(fontsizeTab);
    textbar.appendChild(fontcolorTab);

    fontSize.addEventListener('change', () =>{
        setTimeout(() => {
            if (activeTextBar){
                console.log(fontSize.value);
                console.log(activeTextBar);
                activeTextBar.style.fontSize = `${fontSize.value}px`;
            }
        }, 7);
    });

    fontcolor.addEventListener('change', () => {
        setTimeout(() => {
            if (activeTextBar){
                activeTextBar.style.color = fontcolor.value;
            }
        }, 7);
    });

    if (!editing){
        const plastic = document.createElement('div');
        plastic.classList.add('plastic');
        textbar.appendChild(plastic);
    }
    
    return textbar
}

function arrowBar(nm){
    const header = document.createElement('div');

    header.classList.add('project-header');

    const projectName = document.createElement('div');
    projectName.classList.add('project-name');
    projectName.innerHTML = nm;
    projectName.contentEditable = 'True';

    const dimensionContainer = document.createElement('div');
    dimensionContainer.classList.add('dimensionContainer');

    const square = document.createElement('div');
    square.classList.add('dimension-button');
    square.classList.add('button-selected');
    square.id='square';
    square.innerHTML = `
        <i class="material-symbols-outlined">square</i><div>Square (1:1)</div>
    `;

    const portrait = document.createElement('div');
    portrait.classList.add('dimension-button');
    portrait.id = 'portrait';
    portrait.innerHTML = `
        <i class="material-symbols-outlined">crop_9_16</i><div>Portrait (16:9)</div>
    `;

    const landscape = document.createElement('div');
    landscape.classList.add('dimension-button');
    landscape.id = 'landscape';
    landscape.innerHTML = `
        <i class="material-symbols-outlined">crop_landscape</i><div>Landscape (9:16)</div>
    `;

    const dimensionButtons = [square, portrait, landscape];

    dimensionButtons.forEach(button => {
        button.addEventListener('click', function() {
            for (b of dimensionButtons){
                if (b.classList.contains('button-selected')){
                    b.classList.remove('button-selected');
                }
            }
            button.classList.add('button-selected');
        });
    });


    dimensionContainer.appendChild(square);
    dimensionContainer.appendChild(portrait);
    dimensionContainer.appendChild(landscape);

    header.appendChild(projectName);
    header.appendChild(dimensionContainer);

    return header;
}

function createText(color, size, style, x, y, picture){
    const textBox = document.createElement('div');
    textBox.contentEditable = 'true';
    textBox.innerHTML = 'lorem lpsum';

    textBox.classList.add('text-box');

    textBox.style.top = `${y}px`;
    textBox.style.left = `${x}px`;

    textBox.style.fontSize = `${size}px`;
    textBox.style.color = `${color}`;
    textBox.style.fontStyle = style;

    setTimeout(() => {
        textBox.focus();
    }, 5);
    activeTextBar = textBox;
    textBox.addEventListener('focus', (e) =>{
        activeTextBar = textBox;
        const textbar = projectTitle.querySelectorAll('.textbar')[0];
        if (textbar){
            const fontstyle = textbar.querySelectorAll('select')[0].value;
            const fontsize = textbar.querySelectorAll('.font-size')[0].value;
            const fontcolor = textbar.querySelectorAll('.font-color')[0].value;
            textBox.style.fontSize = `${fontsize}px`;
            textBox.style.color = `${fontcolor}`;
            textBox.style.fontStyle = fontstyle;
        }
    });

    textBox.addEventListener('keydown', (e) =>{
        if (textBox.textContent == ''){
            textBox.remove();
        }
        if (e.key == 'Enter'){
            e.preventDefault();
        }
    });

        
    textBox.addEventListener('mousedown', (e) =>{
        console.log('s1');
        if(textBox.contentEditable === 'false') {
            textBox.style.cursor = 'grab';
            e.preventDefault();

            const rect = picture.getBoundingClientRect();
            const startX = e.clientX;
            const startY = e.clientY;
            const startLeft = parseInt(textBox.style.left) || 0;
            const startTop = parseInt(textBox.style.top) || 0;

            function onMouseMove(e) {
                console.log('s3');
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                textBox.style.left = (startLeft + deltaX) + 'px';
                textBox.style.top = (startTop + deltaY) + 'px';
            }

            function onMouseUp() {

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                textBox.style.cursor = 'default';
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    });

    return textBox;
}

function downloadElementAsImage(element, filename = 'image.png') {
    
    html2canvas(element).then(canvas => {
        
        const image = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.download = filename;
        link.href = image;

        link.click();
    });
}

downloadButton.addEventListener('click', () => {
    console.log('shes');
    const project = document.querySelectorAll('.selected')[0];
    const id = project.id;
    const canvasId = `${id}-canvas`;

    const canvas = document.getElementById(canvasId);
    if (canvas){

        downloadElementAsImage(canvas);
    }
});