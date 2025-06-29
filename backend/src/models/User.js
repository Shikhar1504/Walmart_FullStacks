const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Helper function to get timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Helper function to sanitize data for logging
const sanitizeData = (data) => {
  if (!data) return data;
  
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***HIDDEN***';
    }
  });
  
  return sanitized;
};

// Log database operations
userSchema.pre('save', async function (next) {
  const timestamp = getTimestamp();
  
  if (this.isNew) {
    console.log(`\n👤 [${timestamp}] USER CREATED IN DATABASE`);
    console.log(`   📧 Email: ${this.email}`);
    console.log(`   👤 Name: ${this.name}`);
    console.log(`   🏷️  Role: ${this.role}`);
    console.log(`   🆔 User ID: ${this._id}`);
  } else if (this.isModified('password')) {
    console.log(`\n🔐 [${timestamp}] USER PASSWORD UPDATED`);
    console.log(`   📧 Email: ${this.email}`);
    console.log(`   👤 Name: ${this.name}`);
    console.log(`   🆔 User ID: ${this._id}`);
  } else if (this.isModified()) {
    console.log(`\n✏️  [${timestamp}] USER PROFILE UPDATED`);
    console.log(`   📧 Email: ${this.email}`);
    console.log(`   👤 Name: ${this.name}`);
    console.log(`   🆔 User ID: ${this._id}`);
    console.log(`   📝 Modified fields:`, Object.keys(this.modifiedPaths()));
  }
  
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Log when documents are removed
userSchema.pre('remove', function(next) {
  const timestamp = getTimestamp();
  console.log(`\n🗑️  [${timestamp}] USER DELETED FROM DATABASE`);
  console.log(`   📧 Email: ${this.email}`);
  console.log(`   👤 Name: ${this.name}`);
  console.log(`   🆔 User ID: ${this._id}`);
  next();
});

// Log find operations
userSchema.statics.loggedFind = function(filter) {
  const timestamp = getTimestamp();
  console.log(`\n🔍 [${timestamp}] USER FIND OPERATION`);
  console.log(`   🔍 Filter:`, sanitizeData(filter));
  return this.find(filter);
};

userSchema.statics.loggedFindOne = function(filter) {
  const timestamp = getTimestamp();
  console.log(`\n🔍 [${timestamp}] USER FINDONE OPERATION`);
  console.log(`   🔍 Filter:`, sanitizeData(filter));
  return this.findOne(filter);
};

userSchema.statics.loggedFindById = function(id) {
  const timestamp = getTimestamp();
  console.log(`\n🔍 [${timestamp}] USER FINDBYID OPERATION`);
  console.log(`   🆔 User ID: ${id}`);
  return this.findById(id);
};

// Log update operations
userSchema.statics.loggedUpdateOne = function(filter, update) {
  const timestamp = getTimestamp();
  console.log(`\n✏️  [${timestamp}] USER UPDATEONE OPERATION`);
  console.log(`   🔍 Filter:`, sanitizeData(filter));
  console.log(`   📝 Update:`, sanitizeData(update));
  return this.updateOne(filter, update);
};

userSchema.statics.loggedUpdateMany = function(filter, update) {
  const timestamp = getTimestamp();
  console.log(`\n✏️  [${timestamp}] USER UPDATEMANY OPERATION`);
  console.log(`   🔍 Filter:`, sanitizeData(filter));
  console.log(`   📝 Update:`, sanitizeData(update));
  return this.updateMany(filter, update);
};

userSchema.statics.loggedFindOneAndUpdate = function(filter, update, options) {
  const timestamp = getTimestamp();
  console.log(`\n✏️  [${timestamp}] USER FINDONEANDUPDATE OPERATION`);
  console.log(`   🔍 Filter:`, sanitizeData(filter));
  console.log(`   📝 Update:`, sanitizeData(update));
  if (options) console.log(`   ⚙️  Options:`, options);
  return this.findOneAndUpdate(filter, update, options);
};

// Log delete operations
userSchema.statics.loggedDeleteOne = function(filter) {
  const timestamp = getTimestamp();
  console.log(`\n🗑️  [${timestamp}] USER DELETEONE OPERATION`);
  console.log(`   🔍 Filter:`, sanitizeData(filter));
  return this.deleteOne(filter);
};

userSchema.statics.loggedDeleteMany = function(filter) {
  const timestamp = getTimestamp();
  console.log(`\n🗑️  [${timestamp}] USER DELETEMANY OPERATION`);
  console.log(`   🔍 Filter:`, sanitizeData(filter));
  return this.deleteMany(filter);
};

userSchema.statics.loggedFindByIdAndDelete = function(id) {
  const timestamp = getTimestamp();
  console.log(`\n🗑️  [${timestamp}] USER FINDBYIDANDDELETE OPERATION`);
  console.log(`   🆔 User ID: ${id}`);
  return this.findByIdAndDelete(id);
};

userSchema.methods.comparePassword = function (candidatePassword) {
  const timestamp = getTimestamp();
  console.log(`\n🔍 [${timestamp}] PASSWORD COMPARISON`);
  console.log(`   📧 Email: ${this.email}`);
  console.log(`   👤 Name: ${this.name}`);
  console.log(`   🆔 User ID: ${this._id}`);
  
  return bcrypt.compare(candidatePassword, this.password).then(result => {
    console.log(`   🔐 Password match: ${result ? '✅ Yes' : '❌ No'}`);
    return result;
  });
};

module.exports = mongoose.model('User', userSchema); 