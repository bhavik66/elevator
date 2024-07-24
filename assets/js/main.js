document.addEventListener('DOMContentLoaded', () => {

    const FLOORS = 10
    const FLOOR_HEIGHT = 66 //64 (Height) + 2 (border);
    const ELEVATOR_Y_MARGIN = 10;
    const ELEVATOR_SPEED = 0.75;
    const ARRIVED_WAITING = 2;

    const elevators = document.querySelectorAll('.elevator');
    const buttons = document.querySelectorAll('.floor-call-button');
    const elevatorDing = document.getElementById('elevatorDing');

    const elevatorStates = Array.from({ length: elevators.length }, () => ({
      targetFloor: 1,
      currentFloor: 1,
      isOccupied: false,
      currentFloorInterval: null
    }));

    const waitingState = []

    initialSetElevator()

    function initialSetElevator() {
        elevators.forEach((elevator, index) => {
            const state = elevatorStates[index];
            state.targetFloor = 1;
            state.currentFloor = 1;
            state.isOccupied = false;
            
            elevator.style.transform = `translateY(${getElevatorPositionFromFloor(state.targetFloor)}px)`;
        });
    }

    function getElevatorPositionFromFloor(floor) {
        return -((floor) * FLOOR_HEIGHT) + ELEVATOR_Y_MARGIN
    }

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const floorNumber = parseInt(this.dataset.floor);

            if(this.dataset?.state == 'waiting') {
                this.dataset.state = 'cancelled'
            } else {
                handleElevatorCall(floorNumber);
            }
        });
    });
  
    function handleElevatorCall(floorNumber) {
        const button = document.querySelector(`.floor-call-button[data-floor="${floorNumber}"]`);
        button.classList.add('call-button-waiting');
        button.textContent = 'Waiting';
        button.dataset.state = 'waiting';

        const {closest, minDistance} = findClosestElevatorAndDistance(floorNumber);

        if (closest !== null) {
            moveElevator(closest, minDistance, floorNumber);
        } else {
            waitingState.push(floorNumber)
        }
    }
  
    function findClosestElevatorAndDistance(targetFloor) {
        let minDistance = FLOORS;
        let closest = null;

        elevatorStates.forEach((state, index) => {
            const distance = Math.abs(state.targetFloor - targetFloor);
            if (distance < minDistance && !state.isOccupied) {
                minDistance = distance;
                closest = index;
            }
        });
        
        return {closest, minDistance};
    }
  
    function moveElevator(elevatorIndex, distance, targetFloor) {
        const button = document.querySelector(`.floor-call-button[data-floor="${targetFloor}"]`);
        const floor = document.querySelector(`.floor[data-floor="${targetFloor}"]`);
        const elevatorDoor = floor.querySelector(`.floor-elevator-door[data-elevator="${elevatorIndex + 1}"]`);


        const totalTime = distance * ELEVATOR_SPEED;
        let timeCounter = totalTime

        const state = elevatorStates[elevatorIndex];
        state.isOccupied = true;
        state.targetFloor = targetFloor;
        
        const elevator = elevators[elevatorIndex];
        
        const elevatorSvg = elevator.querySelector('svg');
        const elevatorSvgPath = elevatorSvg.querySelector('path');
        elevatorSvgPath.style.fill = 'tomato';

        state.currentFloorInterval = setInterval(() => {
 
            if(timeCounter > 0) {
                timeCounter -= ELEVATOR_SPEED
                elevatorDoor.textContent = `${timeCounter.toFixed(1)}sec`
            } else {
                elevatorDoor.textContent = ''
            }

            if(button.dataset.state == 'cancelled') {
                state.targetFloor = state.currentFloor
                state.isOccupied = false
                button.classList.remove('call-button-waiting');
                elevatorDoor.textContent = ''

                clearInterval(state.currentFloorInterval)
                reset(elevatorSvgPath, button);

                return
            }

            if(state.currentFloor < targetFloor) {
                state.currentFloor += 1
            } else if(state.currentFloor > targetFloor) {
                state.currentFloor -= 1
            } else {

                elevatorSvgPath.style.fill = 'limegreen';

                button.disabled = true
                button.classList.remove('call-button-waiting');
                button.classList.add('call-button-arrived');
                button.textContent = 'Arrived';
                button.dataset.state = 'arrived';

                elevatorDing.currentTime = 0;
                elevatorDing.play()
    
                clearInterval(state.currentFloorInterval)

                setTimeout(() => {
    
                    state.isOccupied = false;
                    
                    button.classList.remove('call-button-arrived');
                    reset(elevatorSvgPath, button)
                    
    
                    if(waitingState.length > 0) {
                        const targetFloor = waitingState.shift();
                        handleElevatorCall(targetFloor);
                    }
    
                    elevatorDoor.textContent = ''
    
                }, ARRIVED_WAITING * 1000);
            }
            
            style = {
                transition: `transform ${ELEVATOR_SPEED}s linear`,
                transform: `translateY(${getElevatorPositionFromFloor(state.currentFloor)}px)`,
            }

            Object.assign(elevator.style, style);
            
        }, ELEVATOR_SPEED * 1000)
    }

    function reset(elevatorSvgPath, button) {
        elevatorSvgPath.style.fill = 'black';

        button.textContent = 'Call';
        button.dataset.state = 'call';
        button.disabled = false;
    }
  });
  