
/* connecting a Solution to Financial Products */
var diagramNodes2 = [
  {"type":"Solution","id":0,"parent":null,"name":["Treasury"]}, /* Treasury */
  {"type":"Financial_Product","id":7,"parent":null,"number":"175","name":["Foreign Exchange"]},
  {"type":"Financial_Product","id":8,"parent":null,"number":"178","name":["Money Market &", "Discount Papers"]},
  {"type":"Financial_Product","id":9,"parent":null,"number":"180","name":["Interest Rates", "Derivatives"]},
  {"type":"Financial_Product","id":10,"parent":null,"number":"188","name":["Fixed Income"]},
  {"type":"Financial_Product","id":11,"parent":null,"number":"188","name":["Equity"]}
]

var diagramLinks2 = [
  {"source":0, "target":7, "value":1}, /* Solution to Financial Product */
  {"source":0, "target":8, "value":1},
  {"source":0, "target":9, "value":1},
  {"source":0, "target":10, "value":1},
  {"source":0, "target":11, "value":1}
]