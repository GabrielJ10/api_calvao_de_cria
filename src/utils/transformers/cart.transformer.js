const cartTransformer = {
    transform: (cart) => {
      if (!cart) return null;
  
      const transformedCart = {
        id: cart._id,
        

        items: cart.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          mainImageUrl: item.mainImageUrl,
          quantity: item.quantity,
          price: item.price,
          promotionalPrice: item.promotionalPrice || null,
          unitPrice: item.unitPrice,
          totalItemPrice: item.totalItemPrice,
        })),
        
      };
  
      if (cart.userId) {
        transformedCart.userId = cart.userId;
      } else if (cart.guestCartId) {
        transformedCart.guestCartId = cart.guestCartId;
      }
  
      return transformedCart;
    },
  };
  
  module.exports = cartTransformer;