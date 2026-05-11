/*Scala è perfetto per elaborare dati grazie alle sue potenti Collezioni e all'integrazione con l'ecosistema Java.

Obiettivo: Leggere un file CSV di vendite, filtrare le righe per una categoria specifica e calcolare la media dei prezzi.

Cosa impari: Case classes, le funzioni filter/map/reduce e come combinare lo stile orientato agli oggetti con quello funzionale.*/

def csv_filter(category: String, CSV: String): Double = {
    val file = scala.io.Source.fromFile("dati.csv")
    val lines = file.getLines().toList
    file.close()

    val elem =lines.map(line => line.split(","))
    val filtered = elem.filter(row => row(1) == category)
    val prices = filtered.map(row => row(2).toDouble)
    val avg = prices.sum / prices.length
    avg
}