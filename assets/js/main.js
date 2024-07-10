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
      currentFloor: 1,
      isOccupied: false
    }));

    const waitingState = []

    initialSetElevator()

    function initialSetElevator() {
        elevators.forEach((elevator, index) => {
            const state = elevatorStates[index];
            state.currentFloor = 1;
            state.isOccupied = false;
            
            elevator.style.transform = `translateY(${getElevatorPositionFromFloor(state.currentFloor)}px)`;
        });
    }

    function getElevatorPositionFromFloor(floor) {
        return -((floor) * FLOOR_HEIGHT) + ELEVATOR_Y_MARGIN
    }

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const floorNumber = parseInt(this.dataset.floor);
            this.disabled = true;
            handleElevatorCall(floorNumber, this);
        });
    });
  
    function handleElevatorCall(floorNumber) {
        const button = document.querySelector(`.floor-call-button[data-floor="${floorNumber}"]`);
        button.classList.add('call-button-waiting');
        button.textContent = 'Waiting';

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
            const distance = Math.abs(state.currentFloor - targetFloor);
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

        const interval = setInterval(() => { 
            if(timeCounter > 0) {
                timeCounter -= 0.1
                elevatorDoor.textContent = `${timeCounter.toFixed(1)}sec`
            } else {
                elevatorDoor.textContent = ''
            }
        }, 100)


        const elevator = elevators[elevatorIndex];
        
        const elevatorSvg = elevator.querySelector('svg');
        const elevatorSvgPath = elevatorSvg.querySelector('path');
        elevatorSvgPath.style.fill = 'tomato';

        const state = elevatorStates[elevatorIndex];
        state.isOccupied = true;
        state.currentFloor = targetFloor;
        style = {
            transition: `transform ${totalTime}s linear`,
            transform: `translateY(${getElevatorPositionFromFloor(targetFloor)}px)`,
        }
        Object.assign(elevator.style, style);

        setTimeout(() => {

            elevatorSvgPath.style.fill = 'limegreen';

            button.classList.remove('call-button-waiting');
            button.classList.add('call-button-arrived');
            button.textContent = 'Arrived';
            
            elevatorDing.currentTime = 0;
            elevatorDing.play()

            setTimeout(() => {

                state.isOccupied = false;

                elevatorSvgPath.style.fill = 'black';
                
                button.classList.remove('call-button-arrived');
                button.textContent = 'Call';
                button.disabled = false;

                if(waitingState.length > 0) {
                    const targetFloor = waitingState.shift();
                    handleElevatorCall(targetFloor);
                }

                elevatorDoor.textContent = ''
                clearInterval(interval)

            }, ARRIVED_WAITING * 1000);
        }, totalTime * 1000);
    }

  });
  