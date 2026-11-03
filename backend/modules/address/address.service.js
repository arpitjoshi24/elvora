const Address = require("../../models/address.model");

// 1. Add new address
const addAddress = async (userId, addressData) => {
  const {
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
    landmark,
    addressType,
    isDefault
  } = addressData;

  // Check required fields
  if (
    !fullName ||
    !phone ||
    !addressLine ||
    !city ||
    !state ||
    !pincode
  ) {
    throw new Error("Please provide all required address details");
  }

  // Validate phone number
  if (!/^\d{10}$/.test(phone)) {
    throw new Error("Phone number must contain exactly 10 digits");
  }

  // Validate pincode
  if (!/^\d{6}$/.test(pincode)) {
    throw new Error("Pincode must contain exactly 6 digits");
  }

  // Check whether user already has an address
  const existingAddress = await Address.findOne({ user: userId });

  const makeDefault = isDefault === true || !existingAddress;

  // If new address is default, remove default from previous address
  if (makeDefault) {
    await Address.updateMany(
      { user: userId },
      { isDefault: false }
    );
  }

  const address = await Address.create({
    user: userId,
    fullName,
    phone,
    addressLine,
    city,
    state,
    pincode,
    landmark,
    addressType,
    isDefault: makeDefault
  });

  return address;
};


// 2. Get all addresses of user
const getAllAddresses = async (userId) => {
  const addresses = await Address.find({ user: userId })
    .sort({ isDefault: -1, createdAt: -1 });

  return addresses;
};


// 3. Get address by ID
const getAddressById = async (userId, addressId) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId
  });

  if (!address) {
    throw new Error("Address not found");
  }

  return address;
};


// 4. Update address
const updateAddress = async (userId, addressId, updateData) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId
  });

  if (!address) {
    throw new Error("Address not found");
  }

  const allowedFields = [
    "fullName",
    "phone",
    "addressLine",
    "city",
    "state",
    "pincode",
    "landmark",
    "addressType"
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      address[field] = updateData[field];
    }
  });

  if (address.phone && !/^\d{10}$/.test(address.phone)) {
    throw new Error("Phone number must contain exactly 10 digits");
  }

  if (address.pincode && !/^\d{6}$/.test(address.pincode)) {
    throw new Error("Pincode must contain exactly 6 digits");
  }

  await address.save();

  return address;
};


// 5. Set default address
const setDefaultAddress = async (userId, addressId) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId
  });

  if (!address) {
    throw new Error("Address not found");
  }

  // Remove default status from all user's addresses
  await Address.updateMany(
    { user: userId },
    { isDefault: false }
  );

  address.isDefault = true;

  await address.save();

  return address;
};


// 6. Delete address
const deleteAddress = async (userId, addressId) => {
  const address = await Address.findOne({
    _id: addressId,
    user: userId
  });

  if (!address) {
    throw new Error("Address not found");
  }

  const wasDefault = address.isDefault;

  await address.deleteOne();

  // If deleted address was default, choose another address
  if (wasDefault) {
    const nextAddress = await Address.findOne({ user: userId })
      .sort({ createdAt: -1 });

    if (nextAddress) {
      nextAddress.isDefault = true;
      await nextAddress.save();
    }
  }

  return true;
};


module.exports = {
  addAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  setDefaultAddress,
  deleteAddress
};