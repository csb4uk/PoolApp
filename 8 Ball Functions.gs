var url_8 = 'https://docs.google.com/spreadsheets/d/1StjWr-XT_CwX6H-vC3aNFfMCTrakD0p2Fh6Eo0y3d8c/edit#gid=557628240';
function updateScore(val_obj){
  var ss = SpreadsheetApp.openByUrl(url_8);
  var ws = ss.getSheetByName("Polling");
  ws.getRange('$A$3').setValue(val_obj.s1);
  ws.getRange('$B$3').setValue(val_obj.s2);
}
function getScore() {
  var ss = SpreadsheetApp.openByUrl(url_8);
  var ws = ss.getSheetByName("Polling");
  var score_obj = {};
  score_obj.s1 = ws.getRange('$A$3').getValue();
  score_obj.s2 = ws.getRange('$B$3').getValue();
  return score_obj;
}
function update_elo_8(val_obj){
  var ss = SpreadsheetApp.openByUrl(url_8);
  var ws = ss.getSheetByName("Total Stats");
  
  var player_names = ws.getRange(1, 1, ws.getLastRow(), 1).getValues().flat();
  var elo_rating = ws.getRange(1, 2, ws.getLastRow(), 1).getDisplayValues().flat();  
  
  // Player 1 ELO
  if (val_obj.p1 =='-') {
    val_obj.elo_p1 = '-';
  } else if (elo_rating[player_names.indexOf(val_obj.p1)] != null) {
    val_obj.elo_p1 = elo_rating[player_names.indexOf(val_obj.p1)];
  } else {
    val_obj.elo_p1 = 1000;
  }
  // Player 2 ELO
  if (val_obj.p2 =='-') {
    val_obj.elo_p2 = '-';
  } else if (elo_rating[player_names.indexOf(val_obj.p2)] != null) {
    val_obj.elo_p2 = elo_rating[player_names.indexOf(val_obj.p2)];
  } else {
    val_obj.elo_p2 = 1000;
  }
  // Player 3 ELO
  if (val_obj.p3 =='-') {
    val_obj.elo_p3 = '-';
    val_obj.elo_1 = val_obj.elo_p1;
  } else if (elo_rating[player_names.indexOf(val_obj.p3)] != null) {
    val_obj.elo_p3 = elo_rating[player_names.indexOf(val_obj.p3)];
    val_obj.elo_1 = (parseInt(val_obj.elo_p1) + parseInt(val_obj.elo_p3)) / 2;
  } else {
    val_obj.elo_p3 = 1000;
    val_obj.elo_1 = (parseInt(val_obj.elo_p1) + parseInt(val_obj.elo_p3)) / 2
  }
  // Player 4 ELO
  if (val_obj.p4 =='-') {
    val_obj.elo_p4 = '-';
    val_obj.elo_2 = val_obj.elo_p2;
  } else if (elo_rating[player_names.indexOf(val_obj.p4)] != null) {
    val_obj.elo_p4 = elo_rating[player_names.indexOf(val_obj.p4)];
    val_obj.elo_2 = (parseInt(val_obj.elo_p2) + parseInt(val_obj.elo_p4)) / 2
  } else {
    val_obj.elo_p4 = 1000;
    val_obj.elo_2 = (parseInt(val_obj.elo_p2) + parseInt(val_obj.elo_p4)) / 2
  }
  
  if(val_obj.p1 != '-' && val_obj.p2 != '-') {
    var n = ss.getSheetByName('Lists').getRange('$D$2').getValue();
    val_obj.win_1 = ((1 / (1 + Math.pow(10,((val_obj.elo_2-val_obj.elo_1)/n))))*100).toFixed(1);
    val_obj.win_2 = ((1 / (1 + Math.pow(10,((val_obj.elo_1-val_obj.elo_2)/n))))*100).toFixed(1);
  } else {
    val_obj.win_1 = '-';
    val_obj.win_2 = '-';
  }
  Logger.log(val_obj);
  return val_obj;
  
}
function submit_game(val_obj){
  var ss = SpreadsheetApp.openByUrl(url_8);
  var ls = ss.getSheetByName('Lists')
  var data_ws = ss.getSheetByName('Data')
  var date = new Date();
  var k = ls.getRange("$D$1").getValue();
  var n = ls.getRange('$D$2').getValue();
  
  var all_rows = data_ws.getRange("A2:A").getValues();
  var import_row = all_rows.filter(String).length + 2;
  console.log(import_row);
  
  //data_ws.insertRowBefore(import_row);
  var format_src = data_ws.getRange(import_row - 1, 1, 1, data_ws.getLastColumn());
  var format_dest = data_ws.getRange(import_row, 1, 1, data_ws.getLastColumn());
  format_src.copyTo(format_dest, {formatOnly: true});
  
  val_obj.win_1 = 1 / (1 + Math.pow(10,((val_obj.elo_2-val_obj.elo_1)/n)));
  val_obj.win_2 = 1 / (1 + Math.pow(10,((val_obj.elo_1-val_obj.elo_2)/n)));
    
  //============================================
  // Get team stats
  //============================================
  if (val_obj.s1 == val_obj.s2) {
    val_obj.adj_elo_1 = 0;
    val_obj.adj_elo_2 = 0;
    val_obj.w_team = 'Draw';
  } else if (val_obj.s1 > val_obj.s2) {
    val_obj.adj_elo_1 = (k+(Math.abs(val_obj.s1 - val_obj.s2)))*(1-val_obj.win_1);
    val_obj.adj_elo_2 = (k+(Math.abs(val_obj.s1 - val_obj.s2)))*(0-val_obj.win_2);
    val_obj.w_team = 'Team 1';
  } else {
    val_obj.adj_elo_1 = (k+(Math.abs(val_obj.s1 - val_obj.s2)))*(0-val_obj.win_1);
    val_obj.adj_elo_2 = (k+(Math.abs(val_obj.s1 - val_obj.s2)))*(1-val_obj.win_2);
    val_obj.w_team = 'Team 2';
  }
  console.log(val_obj);

  //============================================
  //Make sure all player values match the app
  //============================================
  data_ws.getRange(import_row, 1).setValue(date);
  data_ws.getRange(import_row, 2).setValue(val_obj.game);
  data_ws.getRange(import_row, 3).setValue(val_obj.p1);
  data_ws.getRange(import_row, 4).setValue(val_obj.p3);
  data_ws.getRange(import_row, 5).setValue(val_obj.p2);
  data_ws.getRange(import_row, 6).setValue(val_obj.p4);
  data_ws.getRange(import_row, 7).setValue(val_obj.s1);
  data_ws.getRange(import_row, 8).setValue(val_obj.s2);
  data_ws.getRange(import_row, 9).setValue(val_obj.elo_1);
  data_ws.getRange(import_row, 10).setValue(val_obj.elo_2);
  data_ws.getRange(import_row, 11).setValue(val_obj.win_1);
  data_ws.getRange(import_row, 12).setValue(val_obj.win_2); 
  data_ws.getRange(import_row, 13).setValue(val_obj.w_team);
  data_ws.getRange(import_row, 14).setValue(val_obj.adj_elo_1);
  data_ws.getRange(import_row, 15).setValue(val_obj.adj_elo_2);
  for (var c=16; c <= data_ws.getLastColumn(); c++) {
    var player = data_ws.getRange(2, c).getValue();
    Logger.log(player);
    if (player == val_obj.p1 || player == val_obj.p3) {
      data_ws.getRange(import_row,c).setValue(data_ws.getRange(import_row - 1, c).getValue() + parseInt(val_obj.adj_elo_1));
    } else if (player == val_obj.p2 || player == val_obj.p4) {
      data_ws.getRange(import_row,c).setValue(data_ws.getRange(import_row - 1, c).getValue() + parseInt(val_obj.adj_elo_2));
    } else {
      data_ws.getRange(import_row,c).setValue(data_ws.getRange(import_row - 1, c).getValue());
    }
  }
}
