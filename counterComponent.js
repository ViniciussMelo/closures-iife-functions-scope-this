// IIFE -> Immediately  Invoked Function Expression
(() => {
  const BTN_RESTART = "btnRestart";
  const ID_COUNTER = "counter";
  const COUNTER_VALUE = 100;
  const PERIOD_INTERVAL = 10;

  class CounterComponent {

    constructor() {
      this.initialize();
    }

    prepareProxyCounter() {
      const handler = {
        set: (currentContext, propertyKey, newValue) => {
          // Stop the counter
          if (!currentContext.value) {
            currentContext.stopCounter();
          }

          currentContext[propertyKey] = newValue;
          return true;
        }
      };

      // Event listener
      const counter = new Proxy({
        value: COUNTER_VALUE,
        stopCounter: () => { }
      }, handler);

      return counter;
    }

    // Parcial function
    updateText = ({ counterElement, counter }) => () => {
      counterElement.innerHTML = `Starting at <strong>${counter.value--}</strong> seconds..`;
    }

    // Parcial function
    scheduleStopCounter({ counterElement, intervalId }) {
      return () => {
        clearInterval(intervalId);
        counterElement.innerHTML = "";

        this.disableButton(false);
      }
    }

    scheduleRestartButton(restartElement, initializeFn) {
      // Force context to be the class
      restartElement.addEventListener('click', initializeFn.bind(this));

      return (value = true) => {
        const disabledAttribute = 'disabled';
        restartElement.removeEventListener('click', initializeFn.bind(this));

        if (value) {
          restartElement.setAttribute(disabledAttribute, value);
          return;
        }

        restartElement.removeAttribute(disabledAttribute);
      }
    }

    initialize() {
      // Take the counter element
      const counterElement = document.getElementById(ID_COUNTER);

      const counter = this.prepareProxyCounter();
      // counter.value = 100
      // counter.value = 90
      // counter.value = 80
      const counterObject = {
        counterElement,
        counter
      };

      // Save the variables values
      const fn = this.updateText(counterObject);

      // Execute the function with the initial values
      const intervalId = setInterval(fn, PERIOD_INTERVAL);

      // Change the context
      {
        const restartElement = document.getElementById(BTN_RESTART);
        const disableButton = this.scheduleRestartButton(restartElement, this.initialize);
        disableButton();

        const counterObject = { counterElement, intervalId };
        // Change the context for scheduleStopCounter function
        const stopCounterFn = this.scheduleStopCounter.apply({ disableButton }, [counterObject]);
        counter.stopCounter = stopCounterFn;
      }
    }
  }

  // Only the counter component will have access to this context
  window.CounterComponent = CounterComponent;
})()