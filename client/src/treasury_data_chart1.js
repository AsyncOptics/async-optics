var diagramNodes = [
  {"type":"Solution","id":0,"parent":null,"name":["Treasury"]},
  {"type":"Function","id":12,"parent":null,"number":"209","name":["Front Office"]},
  {"type":"Function","id":13,"parent":null,"number":"210","name":["Middle Office"]},
  {"type":"Function","id":14,"parent":null,"number":"215","name":["Operations"]},
  {"type":"Function","id":15,"parent":null,"number":"215","name":["In-house Banking"]},
  {"type":"Function","id":16,"parent":null,"number":"215","name":["Hedging"]},
  {"type":"Module","id":23,"parent":null,"number":"265","name":["Front Office"]},
  {"type":"Module","id":24,"parent":null,"number":"265","name":["Middle Office:", "P&L and Risk"]},
  {"type":"Module","id":25,"parent":null,"number":"265","name":["Middle Office:", "Market Risk"]},
  {"type":"Module","id":26,"parent":null,"number":"265","name":["Middle Office:", "Limits and Conformity"]},
  {"type":"Module","id":27,"parent":null,"number":"265","name":["Operations:", "Trade Matching "]},
  {"type":"Module","id":28,"parent":null,"number":"265","name":["Operations: Trade", "Lifecycle, Settlement &", "Payment for Derivatives"]},
  {"type":"Module","id":29,"parent":null,"number":"265","name":["Operations: Trade", "Life Cycle & Settlement", "for Securities"]},
  {"type":"Module","id":30,"parent":null,"number":"265","name":["Operations: Corporate", "Actions Bond", "and Warrants"]},
  {"type":"Module","id":31,"parent":null,"number":"265","name":["Operations: Corporate", "Actions Equities"]},
  {"type":"Module","id":32,"parent":null,"number":"265","name":["Accounting"]},
  {"type":"Module","id":33,"parent":null,"number":"265","name":["Treasury Ladder"]},
  {"type":"Module","id":34,"parent":null,"number":"265","name":["Treasury", "Position Limits"]},
  {"type":"Module","id":35,"parent":null,"number":"265","name":["Behavioral Scenario", "Modeling"]},
  {"type":"Module","id":36,"parent":null,"number":"265","name":["Banking Book", "Integration"]},
  {"type":"Module","id":37,"parent":null,"number":"265","name":["Hedge Accounting"]},
  {"type":"Component","id":44,"parent":null,"number":"301","name":["Liquidity Planning"]},
  {"type":"Component","id":45,"parent":null,"number":"302","name":["Liquidity Control"]},
  {"type":"Component","id":46,"parent":null,"number":"310","name":["Procurement:", "Cash"]},
  {"type":"Component","id":47,"parent":null,"number":"311","name":["Procurement:", "Financial", "Investments"]},
  {"type":"Component","id":48,"parent":null,"number":"810","name":["Anglo-Saxon", "Treasury Model"]},
  {"type":"Component","id":49,"parent":null,"number":"910","name":["Trade Workflow"]},
  {"type":"Component","id":50,"parent":null,"number":"960","name":["Account Workflow"]},
  {"type":"Component","id":51,"parent":null,"number":"960","name":["Banking Book"]},
  {"type":"Component","id":52,"parent":null,"number":"960","name":["Credit Management"]},
  {"type":"Component","id":53,"parent":null,"number":"960","name":["In-house Cash", "Management"]},
  {"type":"Component","id":54,"parent":null,"number":"960","name":["Cash Forecast"]},
  {"type":"Component","id":55,"parent":null,"number":"960","name":["Payment Settlement"]},
  {"type":"Component","id":56,"parent":null,"number":"960","name":["Risk Management:", "Interest Rates"]},
  {"type":"Interface","id":61,"parent":null,"number":"500","name":["Bloomberg", "Server API:", "Managed B-Pipe"]},
  {"type":"Interface","id":62,"parent":null,"number":"510","name":["Bloomberg", "Data License", "(Static Data)"]},
  {"type":"Interface","id":63,"parent":null,"number":"540","name":["Reuters Foundation", "API: Price Feed"]},
  {"type":"Interface","id":64,"parent":null,"number":"560","name":["Data Uploader"]}
]

var diagramLinks = [
  {"source":0, "target":12, "value":1}, /* Solution to Function */
  {"source":0, "target":13, "value":1}, /* Solution to Function */
  {"source":0, "target":14, "value":1}, /* Solution to Function */
  {"source":0, "target":15, "value":1}, /* Solution to Function */
  {"source":0, "target":16, "value":1}, /* Solution to Function */
  {"source":12, "target":23, "value":1}, /* Function to Module */
  {"source":13, "target":24, "value":1}, /* Function to Module */
  {"source":13, "target":25, "value":1}, /* Function to Module */
  {"source":13, "target":26, "value":1}, /* Function to Module */
  {"source":14, "target":27, "value":1}, /* Function to Module */
  {"source":14, "target":28, "value":1}, /* Function to Module */
  {"source":14, "target":29, "value":1}, /* Function to Module */
  {"source":14, "target":30, "value":1}, /* Function to Module */
  {"source":14, "target":31, "value":1}, /* Function to Module */
  {"source":15, "target":32, "value":1}, /* Function to Module */
  {"source":15, "target":33, "value":1}, /* Function to Module */
  {"source":15, "target":34, "value":1}, /* Function to Module */
  {"source":15, "target":35, "value":1}, /* Function to Module */
  {"source":15, "target":36, "value":1}, /* Function to Module */
  {"source":16, "target":37, "value":1}, /* Function to Module */
  {"source":23, "target":50, "value":1}, /* Module to Component */
  {"source":24, "target":56, "value":1}, /* Module to Component */
  {"source":25, "target":52, "value":1}, /* Module to Component */
  {"source":26, "target":55, "value":1}, /* Module to Component */
  {"source":27, "target":46, "value":1}, /* Module to Component */
  {"source":28, "target":49, "value":1}, /* Module to Component */
  {"source":30, "target":44, "value":1}, /* Module to Component */
  {"source":31, "target":45, "value":1}, /* Module to Component */
  {"source":32, "target":54, "value":1}, /* Module to Component */
  {"source":32, "target":53, "value":1}, /* Module to Component */
  {"source":32, "target":50, "value":1}, /* Module to Component */
  {"source":33, "target":48, "value":1}, /* Module to Component */
  {"source":34, "target":53, "value":1}, /* Module to Component */
  {"source":35, "target":47, "value":1}, /* Module to Component */
  {"source":36, "target":51, "value":1}, /* Module to Component */
  {"source":0, "target":61, "value":1}, /* Solution to Interface */
  {"source":0, "target":62, "value":1}, /* Solution to Interface */
  {"source":0, "target":63, "value":1}, /* Solution to Interface */
  {"source":0, "target":64, "value":1} /* Solution to Interface */
]
