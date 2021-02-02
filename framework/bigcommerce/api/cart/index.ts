import isAllowedMethod from '../utils/is-allowed-method'
import createApiHandler, {
  BigcommerceApiHandler,
  BigcommerceHandler,
} from '../utils/create-api-handler'
import { BigcommerceApiError } from '../utils/errors'
import getCart from './handlers/get-cart'
import addItem from './handlers/add-item'
import updateItem from './handlers/update-item'
import removeItem from './handlers/remove-item'
import type {
  BigcommerceCart,
  GetCartHandlerBody,
  UpdateCartItemHandlerBody,
} from '../../types'

type OptionSelections = {
  option_id: Number
  option_value: Number | String
}

export type ItemBody = {
  productId: number
  variantId: number
  quantity?: number
  optionSelections?: OptionSelections
}

export type AddItemBody = { item: ItemBody }

export type RemoveItemBody = { itemId: string }

export type CartHandlers = {
  getCart: BigcommerceHandler<BigcommerceCart, GetCartHandlerBody>
  addItem: BigcommerceHandler<
    BigcommerceCart,
    { cartId?: string } & Partial<AddItemBody>
  >
  updateItem: BigcommerceHandler<BigcommerceCart, UpdateCartItemHandlerBody>
  removeItem: BigcommerceHandler<
    BigcommerceCart,
    { cartId?: string } & Partial<RemoveItemBody>
  >
}

const METHODS = ['GET', 'POST', 'PUT', 'DELETE']

// TODO: a complete implementation should have schema validation for `req.body`
const cartApi: BigcommerceApiHandler<Cart, CartHandlers> = async (
  req,
  res,
  config,
  handlers
) => {
  if (!isAllowedMethod(req, res, METHODS)) return

  const { cookies } = req
  const cartId = cookies[config.cartCookie]

  try {
    // Return current cart info
    if (req.method === 'GET') {
      const body = { cartId }
      return await handlers['getCart']({ req, res, config, body })
    }

    // Create or add an item to the cart
    if (req.method === 'POST') {
      const body = { ...req.body, cartId }
      return await handlers['addItem']({ req, res, config, body })
    }

    // Update item in cart
    if (req.method === 'PUT') {
      const body = { ...req.body, cartId }
      return await handlers['updateItem']({ req, res, config, body })
    }

    // Remove an item from the cart
    if (req.method === 'DELETE') {
      const body = { ...req.body, cartId }
      return await handlers['removeItem']({ req, res, config, body })
    }
  } catch (error) {
    console.error(error)

    const message =
      error instanceof BigcommerceApiError
        ? 'An unexpected error ocurred with the Bigcommerce API'
        : 'An unexpected error ocurred'

    res.status(500).json({ data: null, errors: [{ message }] })
  }
}

export const handlers = { getCart, addItem, updateItem, removeItem }

export default createApiHandler(cartApi, handlers, {})
