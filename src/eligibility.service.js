class EligibilityService {
  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */

  /**
   * Get the targeted field from the cart subpart.
   *
   * @param {Object} cartSubPart - The cart subpart object.
   * @param {Array} keys - An array of keys representing the path to the targeted field.
   * @return {any} The value of the targeted field.
   */
  getCartTargetedField(cartSubPart, keys){
    if(!cartSubPart.hasOwnProperty(keys[0])) {
      if (typeof cartSubPart === 'object' && Array.isArray(cartSubPart)) {
        return cartSubPart.map(item => item[keys[0]])
      }
      // raise error
      console.log('error in getCartTargetedField');
      return false;
    }
    if (keys.length === 1) return cartSubPart[keys[0]];
    else return this.getCartTargetedField(cartSubPart[keys[0]], keys.slice(1));
  }

  /**
   * Recursively checks the condition for a given cartTargetedField and criterion.
   *
   * @param {any} cartTargetedField - The field in the cart to check the condition against.
   * @param {any} criterion - The condition to check against the cartTargetedField.
   * @return {boolean} True if the condition is fulfilled, false otherwise.
   */
  checkConditionRecursively(cartTargetedField, criterion) {
    
    if (typeof criterion !== 'object' && typeof cartTargetedField !== 'object') return cartTargetedField == criterion;
    else if (typeof criterion !== 'object' && typeof cartTargetedField === 'object') return cartTargetedField.includes(criterion);
    else {
      const conditionKeys = Object.keys(criterion);
      if (conditionKeys.length!==1) {
        // raise error
        console.log('error in isConditionFulfilled');
        return false
      }
      // pop or [0] ?
      const conditionKey = conditionKeys.pop();
      switch (conditionKey) {
        case 'gt':
          return cartTargetedField > criterion[conditionKey];
        case 'lt':
          return cartTargetedField < criterion[conditionKey];
        case 'gte':
          return cartTargetedField >= criterion[conditionKey];
        case 'lte':
          return cartTargetedField <= criterion[conditionKey];
        case 'and':
          const currentCriteriaAnd = Object.keys(criterion[conditionKey]).map(key => ({[key]: criterion[conditionKey][key]}));
          return currentCriteriaAnd.every(condition => this.checkConditionRecursively(cartTargetedField, condition));
        case 'or':
          const currentCriteriaOr = Object.keys(criterion[conditionKey]).map(key => ({[key]: criterion[conditionKey][key]}));
          return currentCriteriaOr.some(condition => this.checkConditionRecursively(cartTargetedField, condition));
        case 'in':
          // or switch cartTargetedField into array
          if (typeof cartTargetedField !== 'object' || !Array.isArray(cartTargetedField)) return criterion[conditionKey].includes(cartTargetedField);
          return cartTargetedField.filter(item => criterion[conditionKey].includes(item)).length > 0;
      }
    }
  }

  /**
   * Checks if the given condition is fulfilled based on the provided cart, key, and criterion.
   *
   * @param {Object} cart - The cart object.
   * @param {string} key - The key used to retrieve a targeted field from the cart.
   * @param {type} criterion - The criterion used to check the condition.
   * @return {type} - A boolean indicating whether the condition is fulfilled or not.
   */
  isConditionFulfilled(cart, key, criterion){
    const cartTargetedField = this.getCartTargetedField(cart, key.split('.'));
    return this.checkConditionRecursively(cartTargetedField, criterion);
  }

  /**
   * Determines if the given cart is eligible based on the specified criteria.
   *
   * @param {Object} cart - The cart object containing items.
   * @param {Object} criteria - The criteria object specifying the conditions for eligibility.
   * @return {boolean} Returns true if the cart is eligible, false otherwise.
   */
  isEligible(cart, criteria) {
    for (const key in criteria) {
      const criterion = criteria[key];
      if (!this.isConditionFulfilled(cart, key, criterion)) {
        console.log('nok');
        return false;
      }
    }
    return true;
  }
}

module.exports = {
  EligibilityService,
};
