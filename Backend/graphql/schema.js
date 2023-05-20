const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type Review {
        name: String!
        rating: Float!
        title: String!
        comment: String! 
        createdAt: String!
    }

    type Product {
        _id: ID!
        title: String!
        images: [String!] 
        description: String!
        price: Float!
        rating: Float!
        numReviews: Int!
        category: String!
        brand: String
        countInStock: Int!
        reviews: [Review]!
        audience: [String!]!
        discount: Float!
    } 

    type Cart {
        products: [Product!]
        totalPrice: Int!
    }

    type User {
        _id: ID!
        email: String!
        fullname: String!
        password: String
    }

    type Message {
        _id: ID!
        name: String!
        email: String!
        message: String!
    }

    type authData {
        token: String!
        fullname: String!
    }

    type getProductsData {
        products: [Product!]!
        totalProducts: Int!
        count: String
        minPrice: Float
        maxPrice: Float
    }

    type getProductData {
        featuredProducts: [Product!]
        product: Product!
    }

    input userInputData {
        fullname: String
        email: String
        password: String
    }

    input productInputData {
        title: String
        description: String
        price: Float
        images: [String]
        category: String
        audience: [String]
        discount: Float
        brand: String
        countInStock: Int
    }

    input reviewInputData {
        name: String
        rating: Float
        title: String
        comment: String 
        createdAt: String
    }

    type RootMutation {
        signup(userInput: userInputData): User
        createProduct(productInput: productInputData): ID
        createMessage(name: String, email: String, message: String): Boolean
        createReview(productId: ID, reviewInput: reviewInputData): Boolean
        deleteProduct(id: ID!): Boolean
        editProduct(productInput: productInputData, id: ID!): ID
    }

    type RootQuery {
        login(email: String!, password: String!): authData
        getProducts(itemsPerPage: Int!, page: Int, findCondition: String, sortCondition: String): getProductsData
        getProduct(id: ID!, items: Int): getProductData
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
