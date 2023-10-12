const { ProductMaster, ProductDetails } = require('../models/products');
const crypto = require('crypto');

async function getAllProducts(req, res) {
    try {
        const products = await ProductMaster.find();
        const productsWithDetails = [];

        for (const product of products) {
            const productDetails = await ProductDetails.findOne({ master_id: product._id });
            if (productDetails) {
                const mergedProduct = {
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    // image: productDetails.images, // You can choose which image to include here
                    metadata: productDetails.metadata,
                    company: product.company,
                    description: product.description,
                    category: product.category,
                    // shipping: product.shipping,
                };
                productsWithDetails.push(mergedProduct);
            }
        }

        res.status(200).json(productsWithDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getProductById(req, res) {
    try {
        const productId = req.query.id;
        const product = await ProductMaster.findOne({ id: productId });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const productDetails = await ProductDetails.findOne({ master_id: product._id });

        if (!productDetails) {
            return res.status(404).json({ error: 'Product details not found' });
        }

        const mergedProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: productDetails.images, // You can choose which image to include here
            colors: productDetails.colors,
            company: product.company,
            description: product.description,
            category: product.category,
            shipping: product.shipping,
        };

        res.status(200).json(mergedProduct);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function addProduct(req, res) {
    try {
        const { name, price, category, company, description, shipping, metadata, images } = req.body;

        // Generate a unique ID for the productMasterSchema
        const productId = crypto.createHash('md5').update(`${Date.now()}`).digest('hex');

        const existingProduct = await ProductMaster.findOne({ id: productId });

        if (existingProduct) {
            return res.status(400).json({ error: 'Product with the same ID already exists' });
        }

        // Create a new productMasterSchema document
        const newProductMaster = new ProductMaster({
            id: productId,
            name,
            price,
            category,
            company,
            description,
            shipping,
        });


        // Save the productMasterSchema document
        const savedProductMaster = await newProductMaster.save();

        // Generate a unique SKU for the productDetailsSchema
        const sku = crypto.createHash('md5').update(`${Date.now()}`).digest('hex');

        // Create a new productDetailsSchema document
        const productDetails = new ProductDetails({
            sku,
            master_id: savedProductMaster._id, // Set the master_id to the _id of the saved productMasterSchema
            metadata,
            images,
            price,
        });
        // Save the productDetailsSchema document
        await productDetails.save();

        res.status(201).json(savedProductMaster);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function editProduct(req, res) {
    try {
        const { id, name, price, description, colors, images, category, company } = req.body;

        // Find the existing product by ID in ProductMaster
        const productMaster = await ProductMaster.findOne({ id });

        if (!productMaster) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Find the corresponding ProductDetails by master_id
        const productDetails = await ProductDetails.findOne({ master_id: productMaster._id });

        if (!productDetails) {
            return res.status(404).json({ error: 'Product details not found' });
        }

        // Delete the existing ProductMaster and ProductDetails documents
        await productMaster.remove();
        await productDetails.remove();

        // Create new ProductMaster and ProductDetails documents with updated data
        const newProductMaster = new ProductMaster({
            id,
            name,
            price,
            description,
            category,
            company,
        });

        const newProductMasterSaved = await newProductMaster.save();

        const newProductDetails = new ProductDetails({
            sku: productDetails.sku, // You might want to keep the same SKU
            master_id: newProductMasterSaved._id,
            colors,
            images,
            price,
        });

        await newProductDetails.save();

        res.status(200).json(newProductMasterSaved);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function deleteProduct(req, res) {
    try {
        const { id } = req.body;

        const productMaster = await ProductMaster.findOne({ id });

        if (!productMaster) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const productDetails = await ProductDetails.findOne({ master_id: productMaster._id });

        if (!productDetails) {
            return res.status(404).json({ error: 'Product details not found' });
        }

        await productMaster.remove();
        await productDetails.remove();


        res.status(200).json(newProductMasterSaved);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




module.exports = {
    getAllProducts,
    getProductById,
    editProduct,
    addProduct,
    deleteProduct
};
