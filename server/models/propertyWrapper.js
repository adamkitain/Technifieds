function PropertyWrapper(data) {
    this.data = data;
}

PropertyWrapper.prototype.setTag = function(tag) {
    this.tag = tag.tag;
}

exports.model = PropertyWrapper;
