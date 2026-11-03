const {
  addAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  setDefaultAddress,
  deleteAddress
} = require("./address.service");

const mongoose = require("mongoose");

// 1. Add new address
const createAddress = async (req, res) => {
  try {
    const address = await addAddress(
      req.user._id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      address
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// 2. Get all addresses
const getUserAddresses = async (req, res) => {
  try {
    const addresses = await getAllAddresses(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      totalAddresses: addresses.length,
      addresses
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 3. Get address by ID
const getSingleAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID"
      });
    }

    const address = await getAddressById(
      req.user._id,
      addressId
    );

    return res.status(200).json({
      success: true,
      message: "Address fetched successfully",
      address
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};


// 4. Update address
const editAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID"
      });
    }

    const address = await updateAddress(
      req.user._id,
      addressId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// 5. Set default address
const makeDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID"
      });
    }

    const address = await setDefaultAddress(
      req.user._id,
      addressId
    );

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      address
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};


// 6. Delete address
const removeAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID"
      });
    }

    await deleteAddress(
      req.user._id,
      addressId
    );

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createAddress,
  getUserAddresses,
  getSingleAddress,
  editAddress,
  makeDefaultAddress,
  removeAddress
};