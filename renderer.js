// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var azure = require('azure-sb');
var serviceBusService;
var logs = document.getElementById('logs');
var queueName = document.getElementById('queueName');
var resultsDiv = document.getElementById('resultsDiv');
var msg = document.getElementById('msg');
var cStr = document.getElementById('connectionString');

function connectToSB() {
	log("Connecting to service bus..");

	serviceBusService = azure.createServiceBusService(cStr.value);
	if (serviceBusService) {
		log(`Connected to ${serviceBusService.host}.`);
		console.log(serviceBusService);
		listQueues(serviceBusService);
	}
	else {
		alert("Unable to connect");
	}
}
function listQueues(serviceBusService) {
	log("Fetching queue details")
	serviceBusService.listQueues(null, function (error, results) {
		if (error) {
			log(error);
		} else {
			log(`Found ${results.length} queues.`);
			var newOption;
			for (var i = 0, queue; queue = results[i]; i++) {
				newOption = document.createElement("option");
				newOption.value = queue.QueueName;
				newOption.text = queue.QueueName;
				try {
					queueName.add(newOption);
				}
				catch (e) {
					queueName.appendChild(newOption);
				}
			}
		}
	});
}

function receiveMessages() {
	var qname = queueName.value;
	log(`Receiving messages for Queue : ${qname}...`)
	serviceBusService.receiveQueueMessage(qname, { isPeekLock: true }, function (error, lockedMessage) {
		if (!error) {
			log("Message received.");
			msg.value = lockedMessage.body;
			log(`EnqueuedTimeUtc : ${lockedMessage.EnqueuedTimeUtc}`);
		}
		else
		{
			log("No Message found.")
		}
	});
}
function log(msg) {
	var newLine = "\r\n";
	console.log(msg);
	logs.value += newLine + new Date().toLocaleString() + " : " + msg;
}
document.querySelector('#connectBtn').addEventListener('click', connectToSB);
document.querySelector('#receiveMessagesBtn').addEventListener('click', receiveMessages);
log("Initialized.");
