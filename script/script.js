var game_object =
{
  _move_obj(el_id)
  {
    var element = document.getElementById(el_id);
  
  return new Proxy({
      element,
      position:
      {
        x: 0,
        y: 0
      },
      teleport (x, y)
      {
        Reflect.set(this.position, 'x', x);
        Reflect.set(this.position, 'y', y);
        element.style.transform = "translate(" + x + "px," + y + "px)";
      },
      *player_move(s, dirc)
      {
        for (let i = 0; i < s; i++)
        {
          switch (dirc)
          {
            case "up":
              this.position.y -= 10;
              break;
            case "down":
              this.position.y += 10;
              break;
            case "left":
              this.position.x -= 10;
              break;
            case "right":
              this.position.x += 10;
              break;
          }
          element.style.transform = "translate(" + this.position.x + "px," + this.position.y + "px)";
          yield this.position;
        }
      },
      [Symbol('randomJump')] ()
      {
        var rand_x = (Math.random() - 0.5) * 200;
        var rand_y = Math.random() * 200;
        this.teleport(rand_x, rand_y);
      }
    },
    {
      set(target, prop, value)
      {
        target[prop] = value;
        return true;
      }
    });
  },
  bullet_shot ()
  {
    return {
      count_b: 0,
      b_regs: new WeakMap(),
      shoot(_SE) {
        var bullet = document.createElement("div");
        bullet.classList.add("bullet");
        var rect = _SE.getBoundingClientRect();
        var _start = {
          x: rect.left + rect.width / 2 - 5,
          y: rect.bottom
        };
        bullet.style.left = _start.x + "px";
        bullet.style.top = _start.y + "px";
        document.body.appendChild(bullet);
        this.b_regs.set(bullet, {
          timestamp: Date.now(),
          trajectory: []
        });
        this.count_b++;
        var _des_b = function() {
          var t_data = this.b_regs.get(bullet);
          console.log('traject: ', t_data);
          bullet.remove();
          this.count_b--;
        };
        var mv_b = function() {
          var cur_Y = parseInt(bullet.style.top);
          if (cur_Y < window.innerHeight) {
            bullet.style.top = `${cur_Y + 5}px`;
            var t_data = this.b_regs.get(bullet);
            t_data.trajectory.push({
              y: cur_Y
            });
            requestAnimationFrame(mv_b);
          } else {
            _des_b();
          }
        };
        mv_b();
      }
    };
  },
  c_in_hand(p_elemen) {
    return {
      speed: 10,
      k_stat: new Set(),
      * mv_itter() {
        while (true) {
          if (this.k_stat.has('ArrowUp')) yield {
            dx: 0,
            dy: -this.speed
          };
          if (this.k_stat.has('ArrowDown')) yield {
            dx: 0,
            dy: this.speed
          };
          if (this.k_stat.has('ArrowLeft')) yield {
            dx: -this.speed,
            dy: 0
          };
          if (this.k_stat.has('ArrowRight')) yield {
            dx: this.speed,
            dy: 0
          };
          yield {
            dx: 0,
            dy: 0
          };
        }
      },
      initz() {
        document.addEventListener("keydown",
          (event) => {
            this.k_stat.add(event.key);
          });
        document.addEventListener("keyup",
          (event) => {
            this.k_stat.delete(event.key);
          });
        var iterator = this.mv_itter();
        var re_position = function() {
          var {
            dx,
            dy
          } = iterator.next().value;
          var c_trform = p_elemen.style.transform;
          var match = c_trform.match(/translate\((-?\d+)px, (-?\d+)px\)/);
          var cur_X = match ? parseInt(match[1]) : 0;
          var cur_Y = match ? parseInt(match[2]) : 0;
          var n_X = cur_X + dx;
          var n_Y = cur_Y + dy;
          p_elemen.style.transform = `translate(${n_X}px, ${n_Y}px)`;
          requestAnimationFrame(re_position);
        };
        re_position();
      }
    };
  }
};
var p_obj = game_object._move_obj("b");
var i_h = game_object.c_in_hand(document.getElementById("b"));
i_h.initz();
var object = document.getElementById("object");

function animate() {
  var x = (Math.random() - 0.5) * 200;
  var y = Math.random() * 200;
  object.style.transform = `translate(${x}px, ${y}px)`;
}
setInterval(animate, 1000);

function shoot() {
  var bullet = document.createElement("div");
  bullet.classList.add("bullet");
  var rect = object.getBoundingClientRect();
  var obj_cx = rect.left + rect.width / 2 - 5;
  var obj_btm = rect.bottom;
  bullet.style.left = obj_cx + "px";
  bullet.style.top = obj_btm + "px";
  document.body.appendChild(bullet);

  function mv_b() {
    var bullet_Y = parseInt(bullet.style.top);
    if (bullet_Y < window.innerHeight) {
      bullet.style.top = bullet_Y + 5 + "px";
      requestAnimationFrame(mv_b);
    } else {
      bullet.remove();
    }
  }
  mv_b();
}
var random = Math.random() * 900;
setInterval(shoot, random);