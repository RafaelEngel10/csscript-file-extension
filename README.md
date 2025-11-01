## Oque é o CSScript?

- CSScrip (Cascading Styles Script) é uma linguagem de estilização de animações web, baseado tanto no JavaScript, quanto no CSS. Sua sintaxe imita a da linguagem de estilização CSS e seu interpretador é totalmente baseado em JS.


# O que há de especial no CSScript?

- Sua principal característica é facilitar o uso de animações JavaScript, com uma sintaxe mais amigável e legível. Além disso, há características íncriveis a serem exploradas que serão explicadas conforme a idéia do projeto se amplia. Meu objeto com isso é incentivar a criatividade e animar mais um mundo onde a maioria dos sites são estáticos e sem graça.


# Como funciona sua sintaxe?

- Sua sintaxe é simples e imita quase que totalmente a da estilização em cascata:

* elemento/.classe/#id {
    evento.ativador{
        propriedade-especíica: animação(); 
    }
}

- Primeiro se declara o elemento que será feito a animação. Em seguida, coloque o evento o qual vai ser responsável por ativar as animações quando sua condição de ocorrência for verdade. Além disso, é instruido dentro do evento a propriedade que vai ser feita a animação.


# Propriedades CSScript:

- text: ;  ==> propriedade referente ao texto do elemento.

- color: ; ==> propriedade referente a cor do elemento.

- radius: ; ==> propriedade referente ao raio de curvatura de um elemento.

- gap: ; ==> propriedade referente a distância entre dois elementos ou mais.

- weight: ; ==> propriedade referente ao peso de um texto de um elemento.

- message: ; ==> propriedade referente a envio de mensagens para o DOM.

- brightness: ; ==> propriedade referente a claridade de um objeto.

- request: ; ==> propriedade de requisição (Explicação mais detalhada na seção de "Limites responsivos").

- value: ; ==> propriedade de valor (Explicação mais detalhada na seção de "Eventos assíncronos").


# Animações CSScript: 

- text ==
    - fall(duração) => animação de queda suave do texto.

    - rise(duração) => animação de subida suave.

    - slideIn(origem, distância, duração) => animação de deslize do texto.

    - slideOut(sentido, distância, duração) => animação de deslize para fora.

    - fadeIn(duração) => animação de surgimento.

    - fadeOut(duração) => animação de desaparecimento.

    - pop(intensidade, duração) => animação de explosão.

    - implode(intensidade, duração) => animação de implosão.

    - shiver(intensidade, duração) => animação de tremedeira.

    - shake(direção, intensidade, duração) => animação que depende da direção que pode ser até 3 tipos ==
        - "seesaw": "gangorra" -> diagonal; 
        - "cocktail-shaker": "coqueteleira" -> vertical;
        - "sideways": "laterais" -> horizontal;

- color == 
    - fadeColor(cor final, duração) => animação de aparecimento da cor

    - chameleonCamo(cor final, duração) ---> animação de troca de cor, de dentro para fora.

    - octopusCamo(cor final, duraçã) ---> animação de troca de cor, de fora para dentro.

    - paint(direção, cor final, duração) ---> colore conforme a direção.
    

