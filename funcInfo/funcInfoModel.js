class funcInfo {
  constructor(asyncId, triggerAsyncId, type) {
    this.asyncId = asyncId;
    this.triggerAsyncId = triggerAsyncId;
    this.type = type;
    this.startTime = null;
    this.duration = null;
    this.errMessage = null;
  }
}

module.exports = funcInfo;


