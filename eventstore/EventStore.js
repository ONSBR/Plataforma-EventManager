var unirest = require("unirest");
const uuid = require('uuid-v4');


class EventStore {

  /**
   * @description constructor
   * @param {*} config contains 
   * { 
   *     influxip : "some-ip",
   *     database : "some-database"
   * }
   */
  constructor(config) {
    this.config = config;
    this.fieldsToSelect = " \"time\", \"instance_id\", \"name\", \"payload\", \"user_id\", \"user_name\"";
    this.createDb()
        .catch((e) => {
            console.log("error save = '",e,"'");
            throw e;
        });
  }


  /**
   * @method save 
   * @param {*} event contains 
    event: {
       name : "event-name",
       payload : {},    
       user : {
           id : "user-id",
           name : "user-name"
       }
    }
   * @description saves an event in the 'measurement' "events", 
   * with tag "name" containing 'event.name', tag "instance_id" containing
   * the instance id created, and the value "payload" containing 'event.payload'
   * @returns a Promisse with the instance id created, if success; 
   * or an error, if failed
   * @example
        var EventStore = require("../EventStore");

        var config = 
        { 
            influxip : "localhost",
            database : "test003"
        } 

        eventStore = new EventStore(config);

        var evento = 
        {
            name : "almoco",
            payload : 
            { 
                prato : "churrasco", 
                preco : 38.80, 
            },
            user : 
            {
                name : "Joao da Silva",
                id : "RI - 12874"
            }
        }

        var promise = eventStore.save(evento);

        promise
        .then((instance_id) => { 
            console.log("instance id = ", instance_id);
        })
        .catch((e) => {
            console.log("error = ",e)
        });  
   */
  save(event) {
    return new Promise((resolve, reject) => {
        var url = "http://" + this.config.influxip + ":8086/write";

        var req = unirest("POST", url);

        req.query({
        "db": this.config.database,
        "precision": "ms"
        });

        var instance_id = uuid();

        var payload = JSON.stringify(event.payload).replace(/"/g, '\\"');

        var user_name = this.format(event.user.name);
        var user_id = this.format(event.user.id);

    /*     console.log("user name=", user_name);
        console.log("user id=", user_id);
    */

        var line = "events" + "," + 
        "name=" + event.name + "," + 
        "instance_id=" + instance_id + ","  +
        "user_id=" + user_id + "," +
        "user_name=" + user_name + 
        " payload=" + "\"" + payload + "\""; 


        req.send(line);
    
    
        req.end(function (res) {
            if (res.error) {
                reject(res.error);
            }
            else {
                resolve(instance_id);
            }
        });
    });
  }

  /**
   * @description Retrieves a set of instances that have a `user.name` 
   * that matches exactly the one provided
   * @param {*} name 
   * @returns a Promise
   * @example
        var EventStore = require("../EventStore");
        const Config = require("./testConfig.js");

        eventStore = new EventStore(new Config().get());

        var name = "Maria das Neves 1";

        var  promise = eventStore.findByName(name);

        promise
        .then((events) => { 
            var size = events.length; 
            if (size == 0) {
                console.log("No event found");
            }
            else {
                for (var i = 0;  i < size; i++) {
                    var event = events[i];
                    var payload = event.payload;
                    console.log("evento", i, ":"
                                , "ts =", event.timestamp
                                , ", name =", event.name
                                , ", instanceId =", event.instanceId
                                , ", payload.prato =", payload.prato
                                , ", payload.preco =", payload.preco
                                , ", user name = ", event.user.name
                                , ", user id = ", event.user.id);
                }  
                
            }
        })
        .catch((e) => {
            console.log("error = ",e)
        });
   */
  findByUserName(name) {
    var select = "SELECT " + this.fieldsToSelect + " from \"events\" WHERE \"user_name\" = '" + name + "'";
    return this.find(select);
  }
 
  /**
   * @description Retrieves a set of instances that have a `user.id` 
   * that matches exactly the one provided
   * @param {*} id 
   * @example
        var EventStore = require("../EventStore");
        const Config = require("./testConfig.js");

        eventStore = new EventStore(new Config().get());

        var name = "PV - 4587";
        var  promise = eventStore.findByUserId(name);

        promise
        .then((events) => { 
            var size = events.length; 
            if (size == 0) {
                console.log("No event found");
            }
            else {
                for (var i = 0;  i < size; i++) {
                    var event = events[i];
                    var payload = event.payload;
                    console.log("evento", i, ":"
                                , "ts =", event.timestamp
                                , ", name =", event.name
                                , ", instanceId =", event.instanceId
                                , ", payload.prato =", payload.prato
                                , ", payload.preco =", payload.preco
                                , ", user name = ", event.user.name
                                , ", user id = ", event.user.id);
                }  
                
            }
        })
        .catch((e) => {
            console.log("error = ",e)
        });
   */
  findByUserId(id) {
    var select = "SELECT " + this.fieldsToSelect + " from \"events\" WHERE \"user_id\" = '" + id + "'";
    return this.find(select);
  }

  /**
   * @method findByInterval
   * @param start initial timestamp, in miliseconds
   * @param end final initial timestamp, in miliseconds
   * @description retrieves a set of events between 'start' and 'finish', 
   * both excluding   
   * Each element in the set contains:
   * {
   *    timestamp : timestamp-of-the-event
   *    name : event-name
   *    instance_id : instance-that-generated-the-event
   *    payload : JSON specific to the event
   * }
   * 
   * @example
      var EventStore = require("../EventStore");

      var config = 
      { 
          influxip : "localhost",
          database : "test003"
      } 

      eventStore = new EventStore(config);

      // will find
      var start = 1517513761893;
      var end =   1517513864517;


      var  promise = eventStore.findByInterval(start, end);

      promise
      .then((events) => { 
          var size = events.length; 
          if (size == 0) {
              console.log("No event found");
          }
          else {
              for (var i = 0;  i < size; i++) {
                  var event = events[i];
                  var payload = event.payload;
                  console.log("evento", i, ":"
                            , "ts =", event.timestamp
                            , ", name =", event.name
                            , ", instanceId =", event.instanceId
                            , ", payload.prato =", payload.prato
                            , ", payload.preco =", payload.preco
                            , ", user name = ", event.user.name
                            , ", user id = ", event.user.id);
              }  
              console.log(events);
          }
      })
      .catch((e) => {
          console.log("error = ",e)
      });
   */
  findByInterval(start, end = new Date().valueOf()) {

    //console.log("start =", start, ", end = ", end);

    var newEnd = end * 1000000;
    var newStart = start * 1000000;

    var select = "SELECT " + this.fieldsToSelect + " from \"events\" WHERE \"time\" > " + newStart + " AND \"time\" < " + newEnd;
    return this.find(select);
 
  }


  /**
   * @method findEventByInterval
   * @param name name of the event
   * @param start initial timestamp, in miliseconds
   * @param end final initial timestamp, in miliseconds
   * @description retrieves a set of events between 'start' and 'finish', 
   * both excluding   
   * Each element in the set contains:
   * {
   *    timestamp : timestamp-of-the-event
   *    name : event-name
   *    instance_id : instance-that-generated-the-event
   *    payload : JSON specific to the event
   * }
   * 
   * @example
      var EventStore = require("../EventStore");

      var config = 
      { 
          influxip : "localhost",
          database : "test003"
      } 

      eventStore = new EventStore(config);


      var start = 1517513761893;
      var end =   1517514095963;
      var name = "colacao";

      var  promise = eventStore.findByEventInterval(name, start, end);

      promise
      .then((events) => { 
          var size = events.length; 
          if (size == 0) {
              console.log("No event found");
          }
          else {
              for (var i = 0;  i < size; i++) {
                  var event = events[i];
                  var payload = event.payload;
                  console.log("evento", i, ":"
                            , "ts =", event.timestamp
                            , ", name =", event.name
                            , ", instanceId =", event.instanceId
                            , ", payload.prato =", payload.prato
                            , ", payload.preco =", payload.preco
                            , ", user name = ", event.user.name
                            , ", user id = ", event.user.id);
              }  
              
          }
      })
      .catch((e) => {
          console.log("error = ",e)
      });
   */  
  findByEventInterval(name, start, end = new Date().valueOf()) {

    var newEnd = end * 1000000;
    var newStart = start * 1000000;
    var select = "SELECT " + this.fieldsToSelect + " from \"events\" WHERE \"time\" > " + newStart + " AND \"time\" < " + newEnd 
                  + " AND \"name\" = " + "'" + name + "'";

    return this.find(select);
  }

  /**
   * @method find
   * @param {*} select is the SELECT SQL-like influxdb command to be executed
   * @description commands used by other functions are grouped in this function
   */
  find(select) {
//      console.log("select =", select);
    var url = "http://" + this.config.influxip + ":8086/query";

    var req = unirest("POST", url);
 
    req.headers({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    req.form({
      "db": this.config.database,
      "q": select
    });
    
    var self = this;

    return new Promise((resolve, reject) => {
      req.end(function (res) {
        if (res.error) {
          reject(res.error);
        }
        else {
          var results = res.body.results[0];
          self.parseValues(results).then((events) => {
            resolve(events);
          });
        
        }
      });
    });       
  }

  /**
   * 
   * @param {*} results
   * @description parsers a structure like:
    {
        "results": [
            {
                "statement_id": 0,
                "series": [
                    {
                        "name": "events",
                        "columns": [
                            "time",
                            "instance_id",
                            "name",
                            "payload",
                            "user_id",
                            "user_name"
                        ],
                        "values": [
                            [
                                "2018-02-09T13:34:44.642Z",
                                "c4f22880-e7bf-4ec0-874d-3e2d13a43492",
                                "colacao",
                                "{\"prato\":\"suco de melancia\",\"preco\":7}",
                                "PV - 4587",
                                "Maria das Neves 0"
                            ]
                        ]
                    }
                ]
            }
        ]
    }

    into:

    [ { timestamp: '2018-02-09T13:53:36.03Z',
        instanceId: 'd64c0264-8ec1-4723-991f-1bf3c6d8cd43',
        name: 'colacao',
        payload: { prato: 'suco de melancia', preco: 7 },
        user: { name: 'PV - 4587', id: 'Maria das Neves 1' } } ]   
  */
  parseValues(results) {
    return new Promise((resolve, reject) => { 

      if (results.series) {
          var values = results.series[0].values;
          var size = values.length;          
          var events = [];

          for (var i = 0;  i < size; i++) {
            var event = 
            {
              timestamp : values[i][0],
              instanceId : values[i][1],              
              name : values[i][2],
              payload : JSON.parse(values[i][3]),
              user : {
                  name : values[i][4],
                  id : values[i][5]
              }
            }
            events[i] = event;
          }
          resolve(events);
      }
      else {
        resolve([]);
      }
    });
  
  } 


  createDb() {
    var url = "http://" + this.config.influxip + ":8086/query";
    //console.log("url =",url);

    var req = unirest("POST", url);

    req.headers({
        "Cache-Control": "no-cache",
        "Content-Type": "application/x-www-form-urlencoded"
    });
    
    var cmd = "CREATE DATABASE " + this.config.database;
    //console.log("cmd =",cmd);

    req.form({
        "q": cmd
    });

    var self = this;
    return new Promise((resolve, reject) => {
        req.end(function (res) {
          if (res.error) {
            reject(res.error);
          }
          else {
            resolve("db " + self.config.database + " created");
          }
        });
      });    
  }

  
  format(str) {      
    var aux = str;
    aux = aux.replace(/ /g, "\\ ");
    aux = aux.replace(/=/g, "\\=");
    aux = aux.replace(/,/g, "\\,");
    return aux;
  }

}
module.exports = EventStore;