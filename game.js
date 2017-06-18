var maxsize = 10;
var maxspeed = 10;
var maxnumber = 100;
saved_number = 1;

var arrow =  {
Up: false,
    Down: false,
    Right: false,
    Left: false
}


var stage = new Kinetic.Stage({
container: 'container',
width: $("#container").width(),
height: $("#container").height()
});
var layer = new Kinetic.Layer();

var title = new Kinetic.Text(
		{
x:30,
y:30,
text:"infection " + (saved_number/maxnumber*100) + "%",
fontSize:70,
fontFamily:"Lucida Sans Unicode",
fill:"white",
shadowColor:"black"
});

player = get_new_character(true);
player.iscontrolled = true;
player.k_obj.setFill("silver")

var people = new Array(); //Array for all the people
people[0] = player;

for(var i = 1; i < maxnumber; i++)
{
	col = true;
	var person;
	while (col)
	{
		person = get_new_character(false);
		for(j = 0; j < people.length; j++)
		{
			col = check_collision(person, [0,0], people[j], [0,0]);
			if(col)
				break;
		}
	}
	people[i] = person;
	layer.add(people[i].k_obj);
}

layer.add(player.k_obj);
layer.add(title)
	stage.add(layer);

	//Moves all of the people ine the people array
	//Mostly called by kinetic animate thing
function move_people(layer, frame)
{
	//Grid optimization
	for(var i = 0; i < people.length; i++)
	{
		people[i].grid.x = Math.floor(people[i].k_obj.getX()/(maxsize+maxspeed));
		people[i].grid.y = Math.floor(people[i].k_obj.getY()/(maxsize+maxspeed)); 
		if (!people[i].success)
			people[i].destination = get_new_destination();
		if (people[i].ismranderson)
			people[i].destination = get_mr_anderson_direction();
		people[i].success = true;
	}


	for(var i = 0; i < people.length; i++)
	{
		var move1 = [0,0]
			if(!people[i].iscontrolled)
			{
				move1 = get_move(people[i]);
			}
			else
			{
				var speed = 10;
				if (arrow.Left) //Left Arrow Key
					move1[0] -= speed;
				if (arrow.Up) //Up Arrow Key
					move1[1] -= speed;
				if (arrow.Right) //Right Arrow Key
					move1[0] += speed;
				if (arrow.Down) //Top Arrow Key
					move1[1] += speed;
			}

		//Check the first time
		if (people[i].success)
		{
			for(var j = 0; j < people.length; j++)
			{
				if(j != i)
					if ((Math.abs(people[i].grid.x -people[j].grid.x) <= 1) &&
							(Math.abs(people[i].grid.y -people[j].grid.y) <= 1))
					{
						move2 = get_move(people[j]);

						var col = !check_collision(people[i], move1, people[j], move2);
						people[i].success = col && people[i].success;
						people[j].success = col && people[j].success;
					}
			}
		}

		//If still successful
		if(people[i].success)
		{
			people[i].k_obj.setX(people[i].k_obj.getX()+move1[0]);
			people[i].k_obj.setY(people[i].k_obj.getY()+move1[1]);
		}

		if (people[i].k_obj.getX()+move1[0]+maxsize > $("#container").width() || people[i].k_obj.getY()+move1[1]+maxsize > $("#container").height())
		{
			people[i].destination = get_new_destination();
		}

		if (Math.abs(people[i].k_obj.getX() - people[i].destination.x) < 10 && Math.abs(people[i].k_obj.getY() - people[i].destination.y) < 10)
			people[i].destination = get_new_destination();
	}

}
function get_move(person)
{
	var move = [person.destination.x - person.k_obj.getX(), person.destination.y - person.k_obj.getY()];
	if (move[0] != 0)
		move[0] /= Math.abs(move[0]/(person.ismranderson*2+1));				
	if (move[1] != 0)
		move[1] /= Math.abs(move[1]/(person.ismranderson*2+1));
	return move;
}

function check_collision(person1, move1, person2, move2)
{
	if(Math.sqrt(Math.pow(person1.k_obj.getX()+move1[0]-person2.k_obj.getX()-move2[0],2) + Math.pow(person1.k_obj.getY()+move1[1]-person2.k_obj.getY()-move2[1],2)) < 20)
	{
		if((person1.saved || person2.saved) && (!person1.saved || !person2.saved) && !person1.ismranderson && !person2.ismranderson)
		{
			person1.saved = true;
			person2.saved = true;
			if(!person1.iscontrolled)
				person1.k_obj.setFill("white");
			if(!person2.iscontrolled)
				person2.k_obj.setFill("white");
			saved_number++;
		}
		if((person1.ismranderson || person2.ismranderson) && (!person1.ismranderson || !person2.ismranderson))
		{
			assimilate(person1);
			assimilate(person2);
			saved_number--;
		}
		title.setText("infection " + Math.round(saved_number/maxnumber*100) + "%");
		return true;
	}
	return false;
}

function get_new_character(issaved)
{
	fillstring = "";//#2039E3";
	if (issaved)
		fillstring = "white"
			return {
k_obj:	new Kinetic.Circle({
x: Math.floor((Math.random()*(stage.getWidth()-10))+1),
y: Math.floor((Math.random()*(stage.getHeight()-10))+1),
radius:10,
fill:fillstring,
stroke: 'white',
strokeWidth: 4
}),
grid: {x: null, y:null},
	destination: get_new_destination(), // So it knows where it's going
	saved: issaved,
	iscontrolled: false,
	success: true,
	ismranderson: false
	};
}

function get_new_destination()
{
	return {x : Math.floor((Math.random()*stage.getWidth())+1), 
		y : Math.floor((Math.random()*stage.getWidth())+1)};
}

function get_mr_anderson_direction()
{
	return {x : player.k_obj.getX(), 
		y : player.k_obj.getY()};
}

function assimilate(person)
{
	if (!person.ismranderson)
	{
		person.ismranderson = true;
		person.k_obj.setFill("black");
		person.direction = get_mr_anderson_direction();
		person.saved = false;
	}
}

var anim = new Kinetic.Animation(function(frame)
		{ 
		move_people(layer, frame);
		}, layer);

window.addEventListener('keydown', function(e) {
		if (e.keyCode == 37) //Left Arrow Key
		arrow.Left = true;
		if (e.keyCode == 38) //Up Arrow Key
		arrow.Up=true;
		if (e.keyCode == 39) //Right Arrow Key
		arrow.Right = true;
		if (e.keyCode == 40) //Top Arrow Key
		arrow.Down = true;
		if (e.keyCode == 65) //Mr anderson
		assimilate(people[Math.floor(Math.random()*(maxnumber-1))+1]);
		if (e.keyCode == 82) //Restart
		location.reload();
		});

window.addEventListener('keyup', function(e) {
		if (e.keyCode == 37) //Left Arrow Key
		arrow.Left = false;
		if (e.keyCode == 38) //Up Arrow Key
		arrow.Up=false;
		if (e.keyCode == 39) //Right Arrow Key
		arrow.Right = false;
		if (e.keyCode == 40) //Top Arrow Key
		arrow.Down = false;
		if (e.keyCode == 32)
		{
		if (anim.isRunning())
		anim.stop();
		else
		anim.start();
		}
		})
