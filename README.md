# Oque é o CSScript?

- CSScrip (Cascading Styles Script) é uma linguagem de estilização de animações web, baseado tanto no JavaScript, quanto no CSS. Sua sintaxe imita a da linguagem de estilização CSS e seu interpretador é totalmente baseado em JS.


## O que há de especial no CSScript?

- Sua principal característica é facilitar o uso de animações JavaScript, com uma sintaxe mais amigável e legível. Além disso, há características íncriveis a serem exploradas que serão explicadas conforme a idéia do projeto se amplia. Meu objeto com isso é incentivar a criatividade e animar mais um mundo onde a maioria dos sites são estáticos e sem graça.


## Como funciona sua sintaxe?

- Sua sintaxe é simples e imita quase que totalmente a da estilização em cascata:

<pre>elemento/.classe/#id { 
    evento.ativador{
        propriedade-especíica: animação(); 
    }
}  </pre>

- Primeiro se declara o elemento que será feito a animação. Em seguida, coloque o evento o qual vai ser responsável por ativar as animações quando sua condição de ocorrência for verdade. Além disso, é instruido dentro do evento a propriedade que vai ser feita a animação.


## Propriedades CSScript:

- text: ;  ==> propriedade referente ao texto do elemento.

- color: ; ==> propriedade referente a cor do elemento.

- radius: ; ==> propriedade referente ao raio de curvatura de um elemento.

- gap: ; ==> propriedade referente a distância entre dois elementos ou mais.

- weight: ; ==> propriedade referente ao peso de um texto de um elemento.

- message: ; ==> propriedade referente a envio de mensagens para o DOM.

- brightness: ; ==> propriedade referente a claridade de um objeto.

- request: ; ==> propriedade de requisição (Explicação mais detalhada na seção de "Limites responsivos").

- value: ; ==> propriedade de valor (Explicação mais detalhada na seção de "Eventos assíncronos").


## Animações CSScript: 

- text ==
    - fall(duração) ---> animação de queda suave do texto.

    - rise(duração) ---> animação de subida suave.

    - slideIn(origem, distância, duração) ---> animação de deslize do texto.

    - slideOut(sentido, distância, duração) ---> animação de deslize para fora.

    - fadeIn(duração) ---> animação de surgimento.

    - fadeOut(duração) ---> animação de desaparecimento.

    - pop(intensidade, duração) ---> animação de explosão.

    - implode(intensidade, duração) ---> animação de implosão.

    - shiver(intensidade, duração) ---> animação de tremedeira.

    - shake(direção, intensidade, duração) ---> animação que depende da direção que pode ser até 3 tipos ==
        - "seesaw": "gangorra" -> diagonal; 
        - "cocktail-shaker": "coqueteleira" -> vertical;
        - "sideways": "laterais" -> horizontal;

- color == 
    - fadeColor(cor final, duração) ---> animação de aparecimento da cor

    - chameleonCamo(cor final, duração) ---> animação de troca de cor, de dentro para fora.

    - octopusCamo(cor final, duraçã) ---> animação de troca de cor, de fora para dentro.

    - paint(direção, cor final, duração) ---> colore conforme a direção.

- radius ==
    - round(estado inicial, estado final, duração) ---> muda do estado inicial de border-radius para o estado final com uma transição simples.

- gap ==
    - bloom(gap inicial, gap final, duração) ---> transita do gap inicial para o final sem preferência.

    - stagedBloom(horizontal ou vertical, duração) ---> transita do gap inicial para o final com preferência referenciada.

- weight ==
    - skinny(escala, duração) ---> multiplica o peso da fonte pela escala em porcentagem.
    
    - heavy(escala, duração) ---> divide o peso da fonte pela escala em porcentagem.

- message == 
    - alert("Digite a mensagem aqui!", duração) ---> cria uma mensagem no HTML que possui uma duração definida.

- brightness ==
    - halo(intensidade, duração) ---> cria uma luz envolta do texto.

    - neon(cor, direção, intensidade) ---> cria uma luz neon no texto dependendo da direção.

- value == 
    - proposeValue(nome da variável root) ---> cria um objeto que guarda propriedades pré-estabelecidas.

    - searchValue(nome da variável root) ---> executa as animações presentes no objeto. 


##  Eventos CSScript:

### Eventos já feitos =

- DOMContent.onLoad ==
    Assim que o DOM for carregado, realiza uma animação.

- window.onLoad ==
    Assim que a página for totalmente carregada, a animação acontece.

- reveal.onScroll ==
    Realiza a animação assim que for revelado pelo scroll lateral da página.

- onSing.click == 
    Executa a animação ao clicar uma vez em cima do elemento.

- onDbl.click ==
    Executa a animação com um clicar duplo em cima do elemento.

- onHold.click ==
    Executa a animação com o segurar de um clique.


### Eventos ainda não feitos =

- hide.onScroll ==
    Assim que escondido pelo scroll, realiza uma animação.

- onFocus.hold ==
    Quando o elemento é focado, realiza a animação.

- onSelection.hold ==
    Quando um elemento é selecionado, realiza a animação.

- when.Hover ==
    Ao passar o mouse por cima do elemento.

- when.Target ==
    Ao ser transformado em alvo por uma âncora ou link.

- when.CheckBox ==
    Ao ser checado, uma animação ocorre com um elemento input do tipo checkbox.

- when.Checked ==
    Um link ja checado uma vez, realizará uma animação.