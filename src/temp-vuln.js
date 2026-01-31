function insecureEval(userInput) {
  // 🚨 CodeQL will flag this as a security vulnerability
  eval(userInput);  
}

insecureEval("console.log('test')");