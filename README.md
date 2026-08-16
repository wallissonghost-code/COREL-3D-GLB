# COREL 3D GLB Studio V8

Editor 3D no navegador focado no fluxo **CorelDRAW → SVG → GLB**, com suporte adicional para imagens, PDF, DXF, texto 3D e modelagem geométrica.

## V8 — principais recursos

### Importação
- SVG vetorial
- PNG / JPG / WEBP com vetorização automática
- PDF: renderiza a primeira página e vetoriza para peças 3D
- DXF 2D: polilinhas fechadas e círculos
- Projeto JSON salvo pelo próprio editor

### Formas geométricas 2D
- retângulo
- retângulo arredondado
- quadrado
- círculo
- elipse
- triângulo
- losango
- pentágono
- hexágono
- octógono
- estrela
- seta

### Primitivas 3D
- cubo / caixa
- esfera
- cilindro
- cone
- pirâmide
- toro
- cápsula

### Modelagem
- mover / rotacionar / escalar com gizmo
- snap
- espelhar X / Y / Z
- alinhar ao centro
- assentar no chão
- distribuir no eixo X
- booleanas: unir / subtrair / interseção
- relevo e baixo-relevo rápidos
- base automática
- texto 3D

### Materiais e apresentação
- fosco
- brilhante
- plástico
- metálico
- ouro
- cromado
- presets de iluminação
- fundos de preview
- auto-rotação
- salvar preview PNG

### Exportação
- GLB completo
- GLB da peça selecionada
- GLB mesclado
- otimização para Roblox
- salvar / abrir projeto
- desfazer / refazer

## Como usar
Abra `index.html` em um navegador moderno com internet. O projeto carrega Three.js e bibliotecas auxiliares por CDN.

## Limitações atuais
- `.CDR` direto ainda não é aberto pelo navegador; use **CorelDRAW → SVG** para maior fidelidade.
- PDF é convertido pela primeira página renderizada e vetorizada.
- DXF nesta versão prioriza geometria 2D compatível: polilinhas fechadas e círculos.
- Booleanas funcionam melhor em malhas fechadas e relativamente simples.
