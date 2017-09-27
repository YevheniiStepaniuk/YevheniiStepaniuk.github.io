var count = 0;
var statuses;
var streams;
var status_template = (s) => `status_${s}`;
var status_text_template = (s) => `status_${s}_text`;
var stream_url_template = (s) => `stream_${s}_url`;
var stream_key_template = (s) => `stream_${s}_key`;
var stream_id_template = (s) => `stream_${s}`;
var SESSION_STATUS;
var STREAM_STATUS;
var localVideo;
var vidyoConnector;
function init_page() {
    console.log('start')
    Flashphoner.init();
    localVideo = document.createElement("div");
    SESSION_STATUS = Flashphoner.constants.SESSION_STATUS;
    STREAM_STATUS = Flashphoner.constants.STREAM_STATUS;
    statuses = $('#statuses');
    streams = $("#streams");
}

function start_publish() {
    var urlServer = "wss://webstremer.info:8443";
    Flashphoner.createSession({ urlServer: urlServer }).on(SESSION_STATUS.ESTABLISHED, function (session) {
        setSessionStatus("Connection ESTABLISHED",'color-green');
        startStreaming(session);
    }).on(SESSION_STATUS.DISCONNECTED, function () {
        setSessionStatus("Connection DISCONNECTED", 'text-danger');
    }).on(SESSION_STATUS.FAILED, function () {
        setSessionStatus("Connection FAILED", 'text-danger');
    });
}

function startStreaming(session) {
    $('.to-disable').attr('disabled','disabled');
    for (var index = 0; index < count; index++) {
        var streamName = document.getElementById(stream_url_template(index)).value;
        var rtmpUrl_f = document.getElementById(stream_key_template(index)).value;
        session.createStream({
            name: streamName_f,
            display: localVideo,
            cacheLocalResources: true,
            receiveVideo: false,
            receiveAudio: false,
            rtmpUrl: rtmpUrl_f
        }).on(STREAM_STATUS.PUBLISHING, function (publishStream) {
            setStatus(STREAM_STATUS.PUBLISHING, index,'color-green');
        }).on(STREAM_STATUS.UNPUBLISHED, function () {
            setStatus(STREAM_STATUS.UNPUBLISHED, index, 'text-danger');
        }).on(STREAM_STATUS.FAILED, function () {
            setStatus(STREAM_STATUS.FAILED, index, 'text-danger');
        }).publish();
    }

}

function onVidyoClientLoaded(status) {
    console.log("VidyoClient load state - " + status.state);
    if (status.state == "READY") {
        VC.CreateVidyoConnector({
            viewId: "renderer", // Div ID where the composited video will be rendered, see VidyoConnector.html;
            viewStyle: "VIDYO_CONNECTORVIEWSTYLE_Default", // Visual style of the composited renderer
            remoteParticipants: 10, // Maximum number of participants to render
            logFileFilter: "error",
            logFileName: "",
            userData: ""
        }).then(function (vc) {
            console.log("Create success");
            vidyoConnector = vc;
        }).catch(function (error) {
            console.error(error);

        });
    }
}

function addStream() {
    if (count >= 5)
        return;
    buildStreamStatus(count);
    buildStreamInput(count);
    count++;
    $('#streams_count').text(count);
}
function removeStream() {
    if (count <= 0)
        return;
    removeStatus(count - 1);
    removeStreamForm(count - 1);
    count--;
    $('#streams_count').text(count);
}

function buildStreamStatus(number) {
    let el = $(`<li class="list-group-item" id="${status_template(number)}">Stream #${number} status <span id="${status_template(number)}"></span></li>`);
    statuses.append(el);
}

function setStatus(text, number, class_name) {
    let el = document.getElementById(status_text_template(number));
    el.innerText = text;
    el.className = class_name;
}

function setSessionStatus(text, class_name) {
    let el = document.getElementById('session_status');
    el.innerText = text;
    el.className = class_name;
}

function removeStatus(number) {
    $(`#${status_template(number)}`).remove();
}

function buildStreamInput(number) {
    let row = $(`<div class="row" id="${stream_id_template(number)}"></div>`);
    let colmd6_1 = $('<div class="col-md-6"></div>');
    let colmd6_2 = $('<div class="col-md-6"></div>');
    let url = stream_url_template(number);
    let key = stream_key_template(number);
    let formgroup_url = $(`<div class="form-group"><label for="${url}">Stream url</label><input type="text" class="form-control" id="${url}"></div>`);
    let formgroup_key = $(`<div class="form-group"><label for="${key}">Stream key</label><input type="text" class="form-control" id="${key}"></div>`);
    colmd6_1.append(formgroup_url);
    colmd6_2.append(formgroup_key);
    row.append(colmd6_1);
    row.append(colmd6_2);
    console.log(streams.text())
    streams.append(row);
}
function removeStreamForm(number) {
    $(`#${stream_id_template(number)}`).remove();
}
