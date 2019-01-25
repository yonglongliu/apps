
var metadataQueue = [];
var processingQueue = false;
var stopParsingMetadataCallback = null;
var noMoreWorkCallback = null;

//If we need not know details of video, parse video's path is enough.
var easyParseFunction = true;

function initDB() {
  // use excludeFilter to ignore dummy files from camera.
  dump('MEMTEST initDB');
  videodb = new MediaDB('sdcard', null);

  noMoreWorkCallback = function () {
    //TODO ask ui to update video list
    notifyVideoListUpdate();
  };
  
  videodb.onready = function (e) {
    dump('MEMTEST onready');
    enumerateDB();
  };

  videodb.onenumerable = function (e) {
    dump('MEMTEST onenumerable');
    enumerateDB();
  };
  
  videodb.onscanend = function() {
    dump('MEMTEST onscanend');
    // If this was the first scan after startup, then tell
    // performance monitors that the app is finally fully loaded and stable.
    if (!firstScanEnded) {
      firstScanEnded = true;
      // window.performance.mark('fullyLoaded');
    }
    notifyVideoListUpdate();
  };
}

function notifyVideoListUpdate() {
  dump('MEMTEST video-enumerated');
  window.dispatchEvent(new CustomEvent('video-enumerated'));
}

// Remember whether we've already run the enumeration step
var enumerated = false;

// This function runs once when the app starts up. It gets all known videos
// from the MediaDB and handles the appropriately
function enumerateDB() {
  if (enumerated)
    return;
  enumerated = true;
  // var firstBatchDisplayed = false;
  //
  // var batch = [];
  // var batchSize = 4;

  dump('MEMTEST enumerateDB entry');
  videodb.enumerate('date', null, 'prev', function(videoinfo) {

    // When we're done with the enumeration flush any batched files
    if (videoinfo === null) {
      // flush();
      return;
    }

    var isVideo = videoinfo.metadata.isVideo;

    // If we know this is not a video, ignore it
    if (isVideo === false) {
      return;
    }

    if (easyParseFunction === true) {
      addToVideoPathList(videoinfo);
      return;
    }

    // If we don't have metadata for this video yet, add it to the
    // metadata queue to get processed. Once the metadata is
    // available, it will be passed to addVideo()
    if (isVideo === undefined) {
      addToMetadataQueue(videoinfo);
      return;
    }

    //If we've parsed the metadata and know this is a video, display it.
    if (isVideo === true) {
      addVideo(videoinfo);
    }
  });
}

function addToVideoPathList(videodata) {
  if (!videodata) {
    return;
  }
  var path = videodata.name;
  //webm|ogv|ogg|mp4|3gp
  if (path.indexOf('.webm') > 0 || path.indexOf('.ogv') > 0 || path.indexOf('.ogg') > 0 ||
      path.indexOf('.mp4') > 0 || path.indexOf('.3gp') > 0) {
    dump('MEMTEST addVideo path = ' + path);
    videolist.push(path);
  }
}

function addVideo(videodata) {
  if (!videodata || !videodata.metadata.isVideo) {
    return;
  }
  dump('MEMTEST addVideo videodata.name = ' + videodata.name);
  videolist.push(videodata.name);
}

function addToMetadataQueue(fileinfo) {
  metadataQueue.push(fileinfo);
  startParsingMetadata();
}

function startParsingMetadata() {
  if (processingQueue)
    return;
  if (metadataQueue.length === 0) {
    if (noMoreWorkCallback) {
      noMoreWorkCallback();
      noMoreWorkCallback = null;
    }
    return;
  }
  processingQueue = true;
  processFirstQueuedItem();
}

function processFirstQueuedItem() {
  if (stopParsingMetadataCallback) {
    var callback = stopParsingMetadataCallback;
    stopParsingMetadataCallback = null;
    processingQueue = false;
    if (callback !== true)
      callback();
    return;
  }
  if (metadataQueue.length === 0) {
    processingQueue = false;
    if (typeof(noMoreWorkCallback) === 'function') {
      noMoreWorkCallback();
    }
    return;
  }
  var fileinfo = metadataQueue.shift();
  videodb.getFile(fileinfo.name, function (file) {
    getMetadata(file, function (metadata) {
      fileinfo.metadata = metadata;
      videodb.updateMetadata(fileinfo.name, metadata, function () {
        if (metadata.isVideo) {
          videodb.getFileInfo(fileinfo.name, function (dbfileinfo) {
            addVideo(dbfileinfo);
          });
        }
      });
      setTimeout(processFirstQueuedItem);
    });
  }, function (err) {
    console.error('getFile error: ', fileinfo.name, err);
    processFirstQueuedItem();
  });
}

function getMetadata(videofile, callback) {
  var offscreenVideo = document.createElement('video');
  var metadata = {};
  if (!offscreenVideo.canPlayType(videofile.type)) {
    metadata.isVideo = false;
    callback(metadata);
    return;
  }
  var url = URL.createObjectURL(videofile);
  offscreenVideo.preload = 'metadata';
  offscreenVideo.src = url;
  offscreenVideo.onerror = function (e) {
    console.error("Can't play video", videofile.name, e);
    metadata.isVideo = false;
    unload();
    callback(metadata);
  };
  offscreenVideo.onloadedmetadata = function () {
    if (!offscreenVideo.videoWidth) {
      metadata.isVideo = false;
      unload();
      callback(metadata);
      return;
    }
    metadata.isVideo = true;
    dump('MEMTEST onloadedmetadata videofile.name=' + videofile.name);
    metadata.title = readFromMetadata('title') || fileNameToVideoName(videofile.name);
    metadata.duration = offscreenVideo.duration;
    metadata.width = offscreenVideo.videoWidth;
    metadata.height = offscreenVideo.videoHeight;
    unload();
    callback(metadata);
  };

  function readFromMetadata(lowerCaseKey) {
    var tags = offscreenVideo.mozGetMetadata();
    for (var key in tags) {
      if (key.toLowerCase() === lowerCaseKey) {
        return tags[key];
      }
    }
    return;
  }

  function unload() {
    URL.revokeObjectURL(offscreenVideo.src);
    offscreenVideo.removeAttribute('src');
    offscreenVideo.load();
  }

  function fileNameToVideoName(filename) {
    filename = filename.split('/').pop().replace(/\.(webm|ogv|ogg|mp4|3gp)$/, '');
    return filename.charAt(0).toUpperCase() + filename.slice(1);
  }
}

initDB();
