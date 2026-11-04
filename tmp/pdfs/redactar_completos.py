from pathlib import Path
import re,json
from xml.sax.saxutils import escape
from pypdf import PdfReader
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4

ROOT=Path('C:/Users/jisaw/OneDrive/Documentos/tula-maps')
OUT=ROOT/'output/pdf/modulos_completos'
OUT.mkdir(parents=True,exist_ok=True)

# Las denominaciones técnicas, cifras, citas textuales y referencias se conservan.
PAIRS='''
Es importante destacar que|Conviene señalar que
Es importante mencionar que|Debe tenerse presente que
Es importante señalar que|Es preciso señalar que
Es importante considerar que|Conviene tener en cuenta que
Es importante recordar que|Cabe recordar que
Es importante tener en cuenta que|Debe considerarse que
Es importante enfatizar que|Conviene subrayar que
Es relevante destacar que|Cabe resaltar que
Es relevante mencionar que|Conviene mencionar que
Es necesario destacar que|Debe subrayarse que
Es fundamental reconocer que|Resulta esencial reconocer que
Es fundamental que|Resulta esencial que
Es indispensable que|Resulta necesario que
Es necesario que|Se requiere que
Es importante que|Resulta relevante que
Cabe destacar que|Conviene resaltar que
Cabe señalar que|Es preciso mencionar que
Cabe mencionar que|Conviene indicar que
Conviene precisar que|Es necesario aclarar que
Conviene recordar que|Debe recordarse que
Vale la pena destacar que|Conviene poner de relieve que
Vale la pena señalar que|Cabe hacer notar que
No se omite señalar que|También debe señalarse que
No obstante lo anterior|A pesar de lo señalado
Derivado de lo anterior|A partir de lo expuesto
Considerando lo anterior|Con base en lo explicado
Tomando en consideración lo anterior|A la luz de lo expuesto
Tomando en cuenta lo anterior|A partir de estas consideraciones
Por lo anteriormente expuesto|Por las razones expuestas
Tal como se mencionó anteriormente|Como se explicó antes
Como se mencionó anteriormente|Como se indicó previamente
Como se ha mencionado|Como ya se ha señalado
Como se mencionó previamente|Como se explicó con anterioridad
Tal como se estudió|Como se analizó
Tal como se revisó|Como se examinó
Como se revisó|Como se abordó
Como se estudió|Como se examinó
Como se observa|Como puede apreciarse
Como puede observarse|Como se puede apreciar
Como se puede observar|Como es posible advertir
Como puede verse|Como se aprecia
Tal como se observa|Como se advierte
En este sentido|Desde esta perspectiva
En tal sentido|En esa línea
En este contexto|Dentro de este marco
Bajo este contexto|En estas condiciones
Bajo esta lógica|Siguiendo este razonamiento
Bajo esta premisa|A partir de esta idea
Bajo esta perspectiva|Desde este punto de vista
En este marco|En este ámbito
De esta manera|De este modo
De esta forma|Así
De tal manera que|De modo que
De tal forma que|De manera que
Por consiguiente|En consecuencia
Por ende|Por tanto
Por lo tanto|En consecuencia
Por esta razón|Por este motivo
Por tal motivo|Por esa razón
Por esta misma razón|Por ese mismo motivo
En consecuencia de lo anterior|Como consecuencia de lo expuesto
A manera de conclusión|Como cierre del análisis
A modo de conclusión|Para cerrar el análisis
En conclusión|Como conclusión
En síntesis|En conjunto
En términos generales|De forma general
De manera general|En líneas generales
De forma general|En términos amplios
De manera específica|En particular
De forma específica|De manera concreta
En otras palabras|Dicho de otro modo
Dicho de otra manera|Expresado de otra forma
Es decir|Esto significa que
Esto es|Es decir
Por otra parte|Por otro lado
Por otro lado|A su vez
Por su parte|En cuanto a ello
De igual manera|Del mismo modo
De igual forma|De forma semejante
Asimismo|Además
Adicionalmente|También
Finalmente|Por último
Primeramente|En primer término
En primer lugar|Como primer punto
En segundo lugar|Como segundo punto
En tercer lugar|Como tercer punto
En última instancia|En último término
En cambio|Por el contrario
Sin lugar a dudas|Sin duda
Sin duda alguna|Sin duda
A continuación|En los apartados siguientes
En el siguiente apartado|En el apartado que sigue
En los siguientes apartados|En los apartados posteriores
A lo largo de este Módulo|En el desarrollo de este Módulo
A lo largo del Módulo|Durante el estudio del Módulo
A lo largo del Diplomado|Durante el desarrollo del Diplomado
En el presente Módulo|En este Módulo
En el presente Tema|En este Tema
En el presente Diplomado|En este Diplomado
El presente Módulo|Este Módulo
El presente Tema|Este Tema
El presente Diplomado|Este Diplomado
El presente documento|Este documento
Para fines de este Diplomado|Para efectos de este Diplomado
Para los fines de este Diplomado|En el contexto de este Diplomado
Con el fin de|Con el propósito de
Con la finalidad de|Con el objetivo de
A fin de|Para
Con el objetivo de|Con la intención de
Con el propósito de|Para
Con miras a|Con la intención de
En aras de|Con el propósito de
En función de|Según
En virtud de|Debido a
Debido a que|Dado que
Toda vez que|Puesto que
Ya que|Dado que
Puesto que|Debido a que
A pesar de que|Aunque
Si bien|Aunque
En tanto que|Mientras que
En la medida en que|En el grado en que
En relación con|Respecto de
Con relación a|En lo relativo a
En lo que respecta a|Respecto de
Por lo que respecta a|En cuanto a
En lo referente a|En relación con
En lo concerniente a|En lo relativo a
Con respecto a|En relación con
En cuanto a|Respecto de
En materia de|En el ámbito de
En el marco de|Dentro de
En el ámbito de|En el contexto de
Desde el punto de vista de|Desde la perspectiva de
De acuerdo con|Conforme a
De acuerdo a|Según
Con base en|A partir de
Sobre la base de|A partir de
Por medio de|Mediante
A través de|Por medio de
Se lleva a cabo|Se realiza
Se llevan a cabo|Se realizan
Se llevó a cabo|Se efectuó
Se llevaron a cabo|Se efectuaron
Llevar a cabo|Realizar
Llevan a cabo|Realizan
Lleva a cabo|Realiza
Poner en marcha|Iniciar
Puesta en marcha|Inicio de la ejecución
Dar a conocer|Comunicar
Da a conocer|Comunica
Dar cuenta de|Mostrar
Darse cuenta de|Advertir
Hacer frente a|Afrontar
Hacer uso de|Utilizar
Hace uso de|Utiliza
Hacen uso de|Utilizan
Hacer énfasis en|Poner el acento en
Hace énfasis en|Pone el acento en
Pone de manifiesto|Evidencia
Ponen de manifiesto|Evidencian
Poner de manifiesto|Evidenciar
Tiene como propósito|Busca
Tienen como propósito|Buscan
Tiene como finalidad|Busca
Tienen como finalidad|Buscan
Tiene por objeto|Tiene por finalidad
Tiene por objetivo|Se propone
Tienen por objetivo|Se proponen
Tiene como objetivo|Se propone
Tienen como objetivo|Se proponen
Su objetivo principal es|Su propósito central es
Su propósito principal es|Su finalidad central es
Su objetivo general es|Su finalidad general es
Se centra en|Se concentra en
Se centran en|Se concentran en
Está enfocado en|Se orienta a
Están enfocados en|Se orientan a
Está enfocada en|Se orienta a
Están enfocadas en|Se orientan a
Se enfoca en|Se dirige a
Se enfocan en|Se dirigen a
Se encuentra conformado por|Está integrado por
Se encuentra conformada por|Está integrada por
Se encuentran conformados por|Están integrados por
Está conformado por|Se integra por
Está conformada por|Se integra por
Están conformados por|Se integran por
Están conformadas por|Se integran por
Se conforma por|Se integra por
Se conforman por|Se integran por
Se encuentra integrado por|Está compuesto por
Se encuentra integrada por|Está compuesta por
Se encuentra en|Está en
Se encuentran en|Están en
Se encuentran disponibles|Están disponibles
Se encuentra disponible|Está disponible
Se encuentra establecido|Está establecido
Se encuentran establecidos|Están establecidos
Se encuentra establecida|Está establecida
Se encuentran establecidas|Están establecidas
Se encuentra relacionado|Está relacionado
Se encuentra relacionada|Está relacionada
Se encuentran relacionados|Están relacionados
Se encuentran relacionadas|Están relacionadas
Se pueden identificar|Es posible identificar
Se puede identificar|Es posible reconocer
Se pueden observar|Es posible observar
Se puede observar|Es posible apreciar
Se pueden utilizar|Es posible emplear
Se puede utilizar|Es posible emplear
Se puede afirmar que|Cabe afirmar que
Se puede concluir que|Es posible concluir que
Puede ser utilizado|Puede emplearse
Puede ser utilizada|Puede emplearse
Pueden ser utilizados|Pueden emplearse
Pueden ser utilizadas|Pueden emplearse
Permite identificar|Facilita la identificación de
Permiten identificar|Facilitan la identificación de
Permite conocer|Ayuda a conocer
Permiten conocer|Ayudan a conocer
Permite comprender|Ayuda a comprender
Permiten comprender|Ayudan a comprender
Permite determinar|Hace posible determinar
Permiten determinar|Hacen posible determinar
Es posible que|Puede ocurrir que
Es necesario contar con|Se requiere contar con
Es indispensable contar con|Resulta necesario disponer de
Se debe contar con|Se requiere contar con
Se deben considerar|Deben tenerse en cuenta
Se debe considerar|Debe tenerse en cuenta
Se deben tomar en cuenta|Deben considerarse
Se debe tomar en cuenta|Debe considerarse
Se debe tener en cuenta|Es preciso considerar
Se requiere de|Se necesita
Se requiere que|Es necesario que
Resulta indispensable|Es necesario
Resulta fundamental|Es esencial
Resulta importante|Es relevante
Resulta pertinente|Es apropiado
Resulta necesario|Es preciso
Es de gran importancia|Tiene una importancia considerable
Es de suma importancia|Resulta especialmente relevante
De gran relevancia|De especial importancia
De suma relevancia|De especial importancia
Un papel fundamental|Una función esencial
Un papel relevante|Una función importante
Un papel importante|Una función relevante
Un rol fundamental|Una función esencial
Juega un papel|Desempeña una función
Juegan un papel|Desempeñan una función
Jugar un papel|Desempeñar una función
Desempeña un papel|Cumple una función
Desempeñan un papel|Cumplen una función
El logro de|La consecución de
La consecución de|El logro de
La obtención de|La obtención de
La realización de|El desarrollo de
La implementación de|La puesta en práctica de
La identificación de|El reconocimiento de
La recopilación de|La recolección de
La recolección de|La recopilación de
La generación de información|La producción de información
La generación de evidencia|La producción de evidencia
La toma de decisiones|El proceso de decisión
Los tomadores de decisiones|Quienes toman decisiones
Los encargados de|Los responsables de
Las personas encargadas de|Las personas responsables de
En cada una de las|En todas las
En cada uno de los|En todos los
Una serie de|Un conjunto de
Un conjunto de elementos|Una combinación de elementos
Una amplia gama de|Una gran variedad de
Una gran cantidad de|Un número considerable de
Una mayor cantidad de|Una cantidad superior de
En múltiples ocasiones|En numerosas ocasiones
En diversas ocasiones|En distintas ocasiones
En la mayoría de los casos|En buena parte de los casos
En algunos casos|En determinadas situaciones
En muchos casos|En numerosas situaciones
En todos los casos|En cualquier caso
En cualquier momento|En todo momento
En un primer momento|En una primera etapa
En un segundo momento|En una segunda etapa
Al mismo tiempo|De manera simultánea
De manera simultánea|Simultáneamente
De manera conjunta|Conjuntamente
De forma conjunta|De manera coordinada
De manera directa|Directamente
De forma directa|Directamente
De manera indirecta|Indirectamente
De forma indirecta|Indirectamente
De manera sistemática|Sistemáticamente
De forma sistemática|Sistemáticamente
De manera periódica|Periódicamente
De forma periódica|Periódicamente
De manera adecuada|Adecuadamente
De forma adecuada|Adecuadamente
De manera efectiva|Efectivamente
De manera eficiente|Con eficiencia
De manera oportuna|Oportunamente
De forma oportuna|Oportunamente
De manera precisa|Con precisión
De forma precisa|Con precisión
De manera clara|Con claridad
De forma clara|Con claridad
De manera rigurosa|Con rigor
De forma rigurosa|Con rigor
De manera detallada|Con detalle
De forma detallada|Con detalle
De manera integral|Integralmente
De forma integral|Integralmente
De manera particular|En particular
De forma particular|En particular
De manera paulatina|Gradualmente
De forma gradual|Progresivamente
De manera gradual|Progresivamente
En gran medida|En buena medida
Hasta cierto punto|En cierta medida
Más allá de|Además de
No solamente|No solo
No únicamente|No solo
Sino también|Sino además
Así como también|Así como
Así como|Y también
Tanto en el|En el
'''

# No se sustituyen palabras técnicas que distinguen criterios o tipos de evaluación.
WORDS='''
fundamental|esencial
fundamentales|esenciales
indispensable|necesario
indispensables|necesarios
primordial|prioritario
primordiales|prioritarios
crucial|decisivo
cruciales|decisivos
paulatinamente|gradualmente
posteriormente|más adelante
previamente|con anterioridad
principalmente|sobre todo
generalmente|por lo general
usualmente|habitualmente
actualmente|en la actualidad
inicialmente|al inicio
necesariamente|de forma necesaria
únicamente|solo
solamente|solo
específicamente|en concreto
particularmente|en particular
adquiere|cobra
adquieren|cobran
abarca|comprende
abarcan|comprenden
abordar|examinar
aborda|examina
abordan|examinan
abordará|examinará
abordarán|examinarán
abordados|examinados
destacar|resaltar
destaca|resalta
destacan|resaltan
destacando|resaltando
enfatizar|subrayar
enfatiza|subraya
enfatizan|subrayan
enfatizando|subrayando
comprender|entender
comprende|incluye
comprenden|incluyen
comprensión|entendimiento
proporciona|ofrece
proporcionan|ofrecen
proporcionar|ofrecer
proporcionando|ofreciendo
proporcionará|ofrecerá
proporcionarán|ofrecerán
brinda|ofrece
brindan|ofrecen
brindar|ofrecer
brindando|ofreciendo
constituye|representa
constituyen|representan
constituir|representar
constituirá|representará
constituirán|representarán
constituido|integrado
constituida|integrada
constituida por|integrada por
constituido por|integrado por
plantea|propone
plantean|proponen
plantear|proponer
planteando|proponiendo
contempla|prevé
contemplan|prevén
contemplar|prever
contemplado|previsto
contemplada|prevista
contemplados|previstos
contempladas|previstas
establece|señala
establecen|señalan
posibilita|hace posible
posibilitan|hacen posible
posibilitar|hacer posible
facilita|favorece
facilitan|favorecen
facilitar|favorecer
facilitando|favoreciendo
contribuye|ayuda
contribuyen|ayudan
contribuir|ayudar
contribuyendo|ayudando
persigue|busca
persiguen|buscan
persiguiendo|buscando
recabar|reunir
recaba|reúne
recaban|reúnen
recabada|reunida
recabado|reunido
recabadas|reunidas
recabados|reunidos
recopilar|reunir
recopila|reúne
recopilan|reúnen
recopilada|reunida
recopilado|reunido
recopiladas|reunidas
recopilados|reunidos
identificar|reconocer
identifica|reconoce
identifican|reconocen
identificando|reconociendo
identificarse|reconocerse
identificó|reconoció
identificaron|reconocieron
identificará|reconocerá
identificarán|reconocerán
relevancia|importancia
relevante|importante
relevantes|importantes
detalla|describe con detalle
detallan|describen con detalle
detallar|describir con detalle
detalladamente|con detalle
desglosa|desarrolla por partes
desglosan|desarrollan por partes
robusto|sólido
robusta|sólida
robustos|sólidos
robustas|sólidas
robustez|solidez
fortalecer|reforzar
fortalece|refuerza
fortalecen|refuerzan
fortaleciendo|reforzando
fortalecimiento|refuerzo
vincula|relaciona
vinculan|relacionan
vincular|relacionar
vinculando|relacionando
vinculado|relacionado
vinculada|relacionada
vinculados|relacionados
vinculadas|relacionadas
repercute|incide
repercuten|inciden
repercutir|incidir
obstaculiza|dificulta
obstaculizan|dificultan
obstaculizar|dificultar
obstáculos|dificultades
obstáculo|dificultad
desafíos|retos
desafío|reto
transformar|modificar
transforma|modifica
transforman|modifican
transformando|modificando
orienta|dirige
orientan|dirigen
orientar|dirigir
orientando|dirigiendo
encaminadas|dirigidas
encaminados|dirigidos
encaminada|dirigida
encaminado|dirigido
implica|supone
implican|suponen
implicar|suponer
implicando|suponiendo
exige|requiere
exigen|requieren
exigir|requerir
exigiendo|requiriendo
precisa|requiere
emplear|utilizar
emplea|utiliza
emplean|utilizan
empleando|utilizando
empleado|utilizado
empleada|utilizada
empleados|utilizados
empleadas|utilizadas
utilizar|emplear
utiliza|emplea
utilizan|emplean
utilizando|empleando
utilizado|empleado
utilizada|empleada
utilizados|empleados
utilizadas|empleadas
observar|examinar
observa|examina
observan|examinan
evidenciar|mostrar
evidencia que|muestra que
evidencian|muestran
evidenciando|mostrando
demostrar|acreditar
demuestra|acredita
demuestran|acreditan
demostrando|acreditando
analizar|examinar
analiza|examina
analizan|examinan
analizando|examinando
analizará|examinará
analizarán|examinarán
explica|expone
explican|exponen
explicar|exponer
explicando|exponiendo
explicará|expondrá
explicarán|expondrán
describe|expone
describen|exponen
describir|exponer
describiendo|exponiendo
descritos|expuestos
descritas|expuestas
antes mencionado|antes señalado
antes mencionada|antes señalada
antes mencionados|antes señalados
antes mencionadas|antes señaladas
'''

rules={}
for row in (PAIRS+'\n'+WORDS).strip().splitlines():
 if '|' in row:
  a,b=row.strip().split('|',1)
  if a!=b:rules[a.casefold()]=b
for unsafe in ['tanto en el','precisa','comprende','comprenden','comprensión','adquiere','adquieren','más allá de','en todos los casos','es decir','esto es','establece','establecen','demostrar','demuestra','demuestran','demostrando','en cuanto a','contribuye','contribuyen','contribuir','contribuyendo','obstáculo','obstáculos','desafío','desafíos','la identificación de','la realización de','la toma de decisiones','la implementación de','constituye','constituyen','constituir','constituirá','constituirán','contempla','contemplan','contemplar','contemplado','contemplada','contemplados','contempladas','observa','observan','observar']:
 rules.pop(unsafe,None)
rules['por su parte']='A su vez'
# Una sola pasada evita que una sustitución vuelva a modificarse.
rx=re.compile(r'(?<!\w)('+ '|'.join(re.escape(k) for k in sorted(rules,key=len,reverse=True))+r')(?!\w)',re.I)
quote=re.compile(r'(“[^”]*”|«[^»]*»|"[^"\n]*"|https?://\S+)',re.S)
changes=0
def adapt(s):
 global changes
 def sub(m):
  global changes
  a=m.group(0);b=rules[a.casefold()];changes+=1
  if a.isupper():return b.upper()
  if a[0].isupper():return b[0].upper()+b[1:]
  return b[0].lower()+b[1:]
 chunks=quote.split(s)
 return ''.join(c if j%2 else rx.sub(sub,c) for j,c in enumerate(chunks))

headers=[r'Introducción a la Evaluación del Desempeño',r'Herramientas metodológicas para la Evaluación del Desempeño',r'La evaluación del desempeño a Programas presupuestarios\.?',r'La evaluación del desempeño al Gasto Federalizado',r'La evaluación del desempeño a Políticas Públicas',r'La evaluación del desempeño en la práctica\.?',r'Integración de resultados evaluativos para la mejora de las intervenciones públicas']

TITLE=['Fundamentos de evaluación del desempeño','Herramientas metodológicas para evaluar intervenciones','Evaluación de los Programas presupuestarios','Evaluación del gasto federalizado','Evaluación de las Políticas Públicas','Organización práctica de la evaluación','Resultados evaluativos y mejora de las intervenciones']
START=[6,5,5,5,5,5,5]
# Comienzo de índices gráficos y bibliografía en las guías originales.
FIGINDEX=[74,84,77,58,52,52,55]
BIB=[77,86,79,60,53,54,56]

styles={
 'title':ParagraphStyle('title',fontName='Helvetica-Bold',fontSize=15,leading=19,spaceAfter=15,keepWithNext=True),
 'heading':ParagraphStyle('heading',fontName='Helvetica-Bold',fontSize=11.5,leading=15,spaceBefore=11,spaceAfter=8,keepWithNext=True),
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=10.5,leading=14.2,spaceAfter=8),
 'note':ParagraphStyle('note',fontName='Helvetica',fontSize=8.8,leading=11.5,spaceAfter=7),
}
def clean(s):
 s=re.sub(r'\s+',' ',s).strip()
 s=re.sub(r'\s+([,.;:!?])',r'\1',s)
 return s

log=[]
for i in range(1,8):
 r=PdfReader(f'C:/Users/jisaw/OneDrive/Escritorio/Modulo {i}.pdf')
 story=[Paragraph(f'MÓDULO {i}<br/>{TITLE[i-1]}',styles['title'])]
 records=[];before=changes;sourcewords=0;seen_intro=False
 for pno,p in enumerate(r.pages,1):
  if pno<START[i-1] or FIGINDEX[i-1]<=pno<BIB[i-1]:continue
  raw=p.extract_text(extraction_mode='layout') or ''
  lines=raw.splitlines()
  filtered=[]
  for line in lines:
   st=clean(line)
   if re.fullmatch(r'(\d+|[IVX]+)',st):continue
   if any(re.fullmatch(h+r'\s*[IVX]*',st,re.I) for h in headers):continue
   filtered.append(line)
  raw='\n'.join(filtered)
  blocks=[clean(x) for x in re.split(r'\n\s*\n',raw) if clean(x)]
  for j,b in enumerate(blocks):
   # El texto del encabezado se encuentra repartido entre dos líneas en algunos módulos.
   for h in headers:b=re.sub(h+r'\s*[IVX]*(?=\s|$)','',b,flags=re.I).strip()
   if not b:continue
   norm=re.sub(r'\b[IVX]+\b','',b)
   norm=clean(norm)
   if any(re.fullmatch(h,norm,re.I) for h in headers):continue
   if b=='Introducción':
    if seen_intro:continue
    seen_intro=True
   if pno>=FIGINDEX[i-1] and re.search(r'\.{3,}\s*\d+',b):continue
   if i==1 and pno==6 and b.startswith('En el Tema 4 se revisa'):continue
   # Normaliza los encabezados de tema que la extracción entrelaza con su título.
   if 'TEMA ' in b:
    tm=re.search(r'TEMA (\d+)\.',b)
    if tm:b=f'Tema {tm.group(1)}. '+re.sub(r'TEMA \d+\.','',b).strip()
   bibliography=pno>=BIB[i-1]
   sourcewords+=len(b.split())
   ishead=(bool(re.match(r'^Tema \d+(?:\.|$)',b)) or b in ['Introducción','Conclusiones','Bibliografía'] or (len(b)<105 and len(b.split())<=12 and b[0].isupper() and not re.search(r'[.;:,!?]',b) and not b.startswith(('Figura','Cuadro','Fuente:','Tabla','http'))))
   # Los títulos y las referencias conservan denominaciones y trazabilidad.
   protected=bibliography or ishead or b.startswith(('Fuente:','Figura ','Cuadro ','Tabla '))
   new=b if protected else adapt(b)
   records.append({'page':pno,'original':b,'adapted':new,'protected':protected})
   sty='heading' if ishead else 'note' if bibliography or b.startswith('Fuente:') else 'body'
   text=escape(new)
   # Las direcciones largas admiten corte de línea sin perder caracteres.
   for u in re.findall(r'https?://\S+',new):
    eu=escape(u);text=text.replace(eu,'<font size="8">'+eu+'</font>')
   story.append(Paragraph(text,styles[sty]))
 def foot(c,d):
  c.setFont('Helvetica',8.5);c.drawString(50,27,f'Módulo {i}');c.drawRightString(A4[0]-50,27,str(d.page))
 name=OUT/f'Modulo_{i}_texto_completo_reformulado.pdf'
 SimpleDocTemplate(str(name),pagesize=A4,leftMargin=51,rightMargin=51,topMargin=43,bottomMargin=44,title=f'Módulo {i} - {TITLE[i-1]}').build(story,onFirstPage=foot,onLaterPages=foot)
 result=PdfReader(name)
 outtext='\n'.join(p.extract_text() or '' for p in result.pages)
 assert len(outtext.split())>=sourcewords*.95
 assert not any(p.images for p in result.pages)
 assert '\ufffd' not in outtext
 (ROOT/f'tmp/pdfs/modulo_{i}_revision_redaccion.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
 log.append({'module':i,'source_words':sourcewords,'output_words':len(outtext.split()),'pages':len(result.pages),'changes':changes-before,'modified_paragraphs':sum(x['original']!=x['adapted'] for x in records),'paragraphs':len(records)})
 print(json.dumps(log[-1],ensure_ascii=False),flush=True)
(ROOT/'tmp/pdfs/verificacion_completos.json').write_text(json.dumps(log,indent=2),encoding='utf-8')
