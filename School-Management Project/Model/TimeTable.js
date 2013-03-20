﻿/*** @author admin*/(function(){    var    __TimeTable		= model.TimeTable 		= {},    __events		= __TimeTable.events 	= {},    __methods		= __TimeTable.methods 	= {},    ERRORS			= __myNameSpace.ERRORS,    directoryROLES	= __myNameSpace.DirectoryROLES;    __events.onRestrictingQuery = function(){        var        sessionRef		= currentSession(),        theResult		= this.createEntityCollection(),        children,        theUser,        theStudyGroup;		        switch(true){            case sessionRef.belongsTo(directoryROLES.RECORDOFFICER)	:                return this.all();				            case sessionRef.belongsTo(directoryROLES.TEACHER)		:                theUser			= ds.Teacher.first();				                theUser.timeTables.forEach(function(tt){                    theResult.add(tt);                })				                break;            case sessionRef.belongsTo(directoryROLES.STUDENT)		:                theUser			= ds.Student.first();                theStudyGroup	= theUser.studyGroup;				                theStudyGroup && theStudyGroup.timeTables.forEach(function(tt){                    theResult.add(tt);                })				                break;            case sessionRef.belongsTo(directoryROLES.PARENT)		:                theUser		= ds.Parent.first();                theResult = theUser.getTimeTables();				                break;        }		        return theResult;    }    __events.onValidate = function(){        switch(true){            case this.beginDate				:                return ERRORS.Model.TimeTable.invalidBeginDate;			            case this.nbOfHours < 0			:                return ERRORS.Model.TimeTable.invalidNbOfHours;			            case this.nbOfMinutes < 0		:                return ERRORS.Model.TimeTable.invalidNbOfMinutes;			            case !this.teacher				:                return ERRORS.Model.TimeTable.emptyTeacher;			            case this.teacher.isBusy(this):                return ERRORS.Model.TimeTable.teacherIsBusy;			            case !this.studyGroup			:                return ERRORS.Model.TimeTable.emptyStudyGroup;			            case this.studyGroup.isBusy(this):                return ERRORS.Model.TimeTable.studyGroupIsBusy;			            case !this.classroom			:                return ERRORS.Model.TimeTable.emptyClassroom;			            case this.classroom.isBusy(this):                return ERRORS.Model.TimeTable.classroomIsBusy;			            case !this.course				:                return ERRORS.Model.TimeTable.emptyCourse;				//            case ds.Vacancy.isVacancy(this.beginDate)	://                return ERRORS.Model.TimeTable.isVacancy;        }    }	    __events.onInit = function(){        this.nbOfHours 		= 0;        this.nbOfMinutes	= 0;    }	    __events.onSave = function(){        ds.Log.push(__myNameSpace.LOG.getOperation(this , 'save'));    }	    __events.onRemove = function(){        this.timeTables.remove();        ds.Log.push(__myNameSpace.LOG.getOperation(this , 'remove'));    }	    __TimeTable.endDate = {        onGet: function(){            var            res 	= this.beginDate,            resTime;			            if(!res){                return res;            }			            resTime = res.getTime() + (this.nbOfHours*60 + this.nbOfMinutes)*60*1000;            res.setTime(resTime);			            return res;        },        onSet: function(value){            var time = value - this.beginDate;			            if( time < 0 ){                return ERRORS.Model.TimeTable.invalidEndDate;            }			            this.nbOfHours 		= parseInt(time/1000/60/60);            this.nbOfMinutes 	= parseInt(time - this.nbOfHours * 3600 * 1000)/1000/60;        }    }	    __TimeTable.tt_length = {        onGet:function()        {            if(this.tt_length_priv){                return this.tt_length_priv;            }			            return this.endDate - this.beginDate;        }    }        __TimeTable.comment = {    	onGet:function()        {            var res = '';            res += this.teacher ? (this.teacher.fullname + '<br />') : '';            res += this.course ? (this.course.name + '<br />') : '';            res += this.studyGroup ? (this.studyGroup.name + '<br />') : '';            res += this.classroom ? (this.classroom.name) : '';                        return res;        }    }	    __TimeTable.tt_pid = {        onSet:function(value)        {            if(value){            	this.parentTT = (this.getDataClass())(value);            }        },        onGet:function()        {            if(this.parentTT){                return this.parentTT.getKey();            }			            return null;        }    }	    __TimeTable.rec_type = {        onSet:function(value)        {        	if(!value){                this.recurring = null;                return;            }            var recEntity	= ds.Recurring.find('rec_type = :1' , value);			            if(recEntity == null){                recEntity = new ds.Recurring();            }			            var rec = this.recurring ? this.recurring : recEntity;			            rec.rec_type = value;            if(value){                rec.save();                this.recurring = rec;            }        },        onGet:function()        {            if(this.recurring){                return this.recurring.rec_type;            }			            return "";        }    }	    __methods.canIModify = function(){        return currentSession().belongsTo(directoryROLES.ADMINISTRATOR);    }    __methods.canIModify.scope = 'public';	    __methods.editItem = function(id , item , del){    	var entity = this.find('ID = :1' , id);     	        if(del){        	if(entity && entity.getKey() == id){        		try{        			entity.remove();        			return true;        		}catch(e){        			return false;        		}        	}        	        	return false;        }                if(!entity || entity.getKey() != id){            entity = new this();        }                for(var attr in item){            if(attr == 'ID' || attr == 'comment'){                continue;            }            if(this[attr].kind == 'relatedEntity'){                entity[attr] = this[attr].relatedDataClass(item[attr]);            }            else if(this[attr].type == 'date'){                entity[attr] = new Date(item[attr]);            }            else if(item.hasOwnProperty(attr)){                entity[attr] = item[attr];            }        }                if(id && id.toString().indexOf('#') >= 0){        	entity.tt_length = id.split('#')[1];        }		        try{        	entity.save();        }catch(e){        	return e;        }		        return entity;    }    __methods.editItem.scope = 'public';})();