import sys
import os

basedir = os.path.dirname(__file__)
sys.path.append(os.path.join(basedir, os.pardir, os.pardir))
from server.app.models import metadata as model
from sqlalchemy_schemadisplay import create_uml_graph
from sqlalchemy.orm import class_mapper

# lets find all the mappers in our model
mappers = []
for attr in dir(model):
    if attr[0] == "_":
        continue
    try:
        cls = getattr(model, attr)
        mappers.append(class_mapper(cls))
    except Exception:
        pass

# pass them to the function and set some formatting options
graph = create_uml_graph(
    mappers,
    show_operations=False,  # not necessary in this case
    show_multiplicity_one=False,  # some people like to see the ones, some don't
)

graph.write_png(os.path.join(basedir, "schema.png"))  # write out the file
